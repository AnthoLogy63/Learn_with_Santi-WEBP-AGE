import os
import django
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import crear_examen_ejemplo

def generate_sql():
    admin_pw = make_password('12345678')
    user_pw = make_password('87654321')
    
    with open('seed.sql', 'w', encoding='utf-8') as f:
        f.write("-- CREACIÓN DE USUARIOS\n")
        f.write("INSERT INTO users_user (id, password, is_superuser, username, email, is_staff, is_active, date_joined, dni, points, current_streak) VALUES\n")
        f.write(f"(1, '{admin_pw}', true, 'admin', 'admin@example.com', true, true, CURRENT_TIMESTAMP, '12345678', 0, 0),\n")
        f.write(f"(2, '{user_pw}', false, 'usuario', 'usuario@example.com', false, true, CURRENT_TIMESTAMP, '87654321', 0, 0);\n\n")

        f.write("-- CREACIÓN DE EXÁMENES\n")
        exam_1_desc = "Evalúa tu manejo de MiBonito para gestionar bonificaciones y anticipar riesgos."
        exam_2_desc = "Evalúa conocimientos sobre gestión de clientes, prevención de riesgos y control de indicadores."
        
        f.write("INSERT INTO exams_exam (id, name, description, bank_total_questions, questions_per_attempt, max_scored_attempts, max_points, is_active, is_enabled, created_at, updated_at) VALUES\n")
        f.write(f"(1, 'Conociendo MiBonito', '{exam_1_desc}', 20, 10, 3, 100, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),\n")
        f.write(f"(2, 'Teórico de Productividad', '{exam_2_desc}', 20, 10, 3, 100, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\n")

        f.write("-- CREACIÓN DE PREGUNTAS\n")
        f.write("INSERT INTO exams_question (id, exam_id, text, points, time_limit_seconds, question_type) VALUES\n")
        
        q_id = 1
        questions_values = []
        options_values = []
        opt_id = 1
        
        for q in crear_examen_ejemplo.examen1_preguntas:
            text = q['text'].replace("'", "''")
            questions_values.append(f"({q_id}, 1, '{text}', 10, 60, '{q['type']}')")
            for opt_text, is_correct in q.get('options', []):
                o_text = opt_text.replace("'", "''")
                options_values.append(f"({opt_id}, {q_id}, '{o_text}', {str(is_correct).lower()})")
                opt_id += 1
            q_id += 1
            
        for q in crear_examen_ejemplo.examen2_preguntas:
            text = q['text'].replace("'", "''")
            questions_values.append(f"({q_id}, 2, '{text}', 10, 60, '{q['type']}')")
            for opt_text, is_correct in q.get('options', []):
                o_text = opt_text.replace("'", "''")
                options_values.append(f"({opt_id}, {q_id}, '{o_text}', {str(is_correct).lower()})")
                opt_id += 1
            q_id += 1
            
        f.write(",\n".join(questions_values) + ";\n\n")
        
        f.write("-- CREACIÓN DE OPCIONES\n")
        f.write("INSERT INTO exams_option (id, question_id, text, is_correct) VALUES\n")
        f.write(",\n".join(options_values) + ";\n\n")
        
        # Adjust PostgreSQL sequences
        f.write("-- ACTUALIZAR SECUENCIAS (vital para que PostgreSQL no de error al insertar nuevos después)\n")
        f.write("SELECT setval('users_user_id_seq', (SELECT MAX(id) FROM users_user));\n")
        f.write("SELECT setval('exams_exam_id_seq', (SELECT MAX(id) FROM exams_exam));\n")
        f.write("SELECT setval('exams_question_id_seq', (SELECT MAX(id) FROM exams_question));\n")
        f.write("SELECT setval('exams_option_id_seq', (SELECT MAX(id) FROM exams_option));\n")

    print("✅ Archivo seed.sql generado exitosamente.")

if __name__ == "__main__":
    generate_sql()
