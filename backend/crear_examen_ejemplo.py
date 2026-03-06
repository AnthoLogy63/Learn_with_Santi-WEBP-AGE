import os
import django
import random

# Configuración del entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from exams.models import Exam, Question, Option

# Preguntas y opciones de Examen 1 (20)
examen1_preguntas = [
    {"text":"¿Para qué sirve principalmente Mi Bonito en el día a día del analista?",
     "type":"single_choice",
     "options":[
         ("Para imprimir estados de cuenta del cliente", False),
         ("Para gestionar variables del bono con seguimiento, alertas y detalle accionable", True),
         ("Para cambiar la tasa del crédito", False),
         ("Para solicitar vacaciones y permisos", False)]
    },
    {"text":"¿Qué caracteriza al reporte “Mi Bonito Vigente”?",
     "type":"single_choice",
     "options":[
         ("Muestra únicamente clientes en mora > 90 días", False),
         ("Muestra el avance actualizado al día anterior de tus variables y bonificación", True),
         ("Solo muestra el resultado final del cierre de mes", False)]
    },
    {"text":"¿Cuál es el objetivo del reporte “Mi Bonito Mensual”?",
     "type":"single_choice",
     "options":[
         ("Alertarte sobre clientes por vencer hoy", False),
         ("Resumir el resultado total del mes y el cierre de tu bonificación variable", True),
         ("Mostrar solo la adopción digital por agencia", False)]
    },
    {"text":"¿Qué acción esperada busca una “alerta” en Mi Bonito?",
     "type":"single_choice",
     "options":[
         ("Que el analista espere a fin de mes para recién gestionar", False),
         ("Que el analista actúe antes del cierre para evitar penalidades o activar beneficios", True),
         ("Que el analista solo revise indicadores sin intervenir", False)]
    },
    {"text":"¿Qué te comunica la alerta “Bono Día 15”?",
     "type":"single_choice",
     "options":[
         ("Tu ranking institucional de adopción digital", False),
         ("Si activaste (o estás por activar) un factor adicional en fechas clave (Día 10/13/15)", True),
         ("El detalle de seguros vendidos por operaciones", False)]
    },
    {"text":"¿Para qué sirve un “Detalle” (por ejemplo, Detalle Mora o Detalle Retención)?",
     "type":"single_choice",
     "options":[
         ("Para cambiar metas del bono del analista", False),
         ("Para ver el listado de casos/cliente con montos y días, y priorizar acciones", True),
         ("Para registrar desembolsos del sistema core", False)]
    },
    {"text":"Si quieres recibir automáticamente tus reportes por correo, ¿qué mecanismo usas?",
     "type":"single_choice",
     "options":[
         ("Solicitud por autoservicio (asunto de correo)", True),
         ("Captura de pantalla del sistema", False),
         ("Llamada telefónica al área de TI", False)]
    },
    {"text":"¿Cuál es el valor de revisar alertas durante el mes (y no solo al cierre)?",
     "type":"single_choice",
     "options":[
         ("Ninguno, porque el bono se calcula una sola vez al final", False),
         ("Permite anticipar riesgo, corregir gestión y maximizar el resultado final", True),
         ("Solo sirve para ver gráficos bonitos", False)]
    },
    {"text":"Una alerta “Pase a 90” se usa principalmente para...",
     "type":"single_choice",
     "options":[
         ("Focalizar gestión en clientes con riesgo crítico y evitar castigo/penalidad", True),
         ("Aumentar automáticamente el monto del bono por cumplimiento", False),
         ("Cambiar el tipo de producto del cliente", False)]
    },
    {"text":"¿Qué describe mejor el “día a día” recomendado con Mi Bonito?",
     "type":"single_choice",
     "options":[
         ("Revisar una vez al mes y no hacer seguimiento", False),
         ("Consultar reportes/alertas, priorizar casos críticos y ejecutar acciones de gestión", True),
         ("Solo usar Mi Bonito cuando el jefe lo pida", False)]
    },
    {"text":"¿A qué correos envían las solicitudes de autoservicio de Mi Bonito?",
     "type":"single_choice",
     "options":[
         ("mibonito@cajarequipa.pe", True),
         ("bonito@cajarequipa.pe", False),
         ("soporte_bonito@cajarequipa.pe", False),
         ("mibono@cajarequipa.pe", False)]
    },
    {"text":"¿Cuál es el objetivo principal de las alertas de Mi Bonito?",
     "type":"single_choice",
     "options":[
         ("Anticipar riesgos que afecten la bonificación y ayudarte a tener tu mejor bono.", True),
         ("Mostrar información histórica de tu gestión.", False),
         ("Registrar clientes castigados y morosos.", False),
         ("Generar reportes automáticos en razón.", False)]
    },
    {"text":"Si deseas conocer el resultado total de tu bonificación del mes de enero, ¿qué debes colocar en el asunto?",
     "type":"single_choice",
     "options":[
         ("Mi bonito enero", True),
         ("Reporte del mes de enero", False),
         ("Mi bonito al 31.01.2025", False),
         ("Mi bonito cierre enero", False)]
    },
    {"text":"¿Qué debes colocar en el asunto del correo para recibir tu cartilla de Mi Bonito actualizada al día anterior?",
     "type":"single_choice",
     "options":[
         ("Mi cartilla bonito", False),
         ("Mi bonito este", True),
         ("Consulta de bonos", False),
         ("Mi bonito a ayer", False)]
    },
    {"text":"¿Qué tipo de información entregará la alerta de cartera al día?",
     "type":"single_choice",
     "options":[
         ("Clientes con cuotas próximas a vencer hoy y los próximos tres días", True),
         ("Créditos castigados", False),
         ("Clientes que ya están en mora", False),
         ("Solo el monto total de cartera", False)]
    },
    {"text":"¿Qué tipo de información entregará la alerta de pase a 90?",
     "type":"single_choice",
     "options":[
         ("Clientes en el rango mayor a 90 y adicional del rango 61-90", True),
         ("Clientes en el rango mayor a 90", False),
         ("Clientes que están próximos a vencer sus cuotas", False),
         ("30-60", False)]
    },
    {"text":"¿Para qué te servirán las alertas del bono día 15?",
     "type":"multiple_choice",
     "options":[
         ("Para avisarme que llegué a estar positivo y obtuve factor", True),
         ("Para avisarme cuánto me falta para estar positivo en los días clave", True),
         ("Para avisarme qué días de la semana caen 10, 13 y 15", True),
         ("Para recordarme que existe el factor", True)]
    },
    {"text":"¿Dónde podrás encontrar tus clientes a gestionar en contención de 0 a 30?",
     "type":"single_choice",
     "options":[
         ("Autoservicio de mi contención", False),
         ("Debajo de la cartilla de recomendación de Mi Bonito", True),
         ("Me llegará al correo como alerta", False),
         ("Bono Día 15", False)]
    },
    {"text":"¿Cuál es la variable que se te dificulta más comprender en la nueva remuneración variable?",
     "type":"single_choice",
     "options":[
         ("Bono retención a 30 días", True),
         ("Cartera al día", True),
         ("Bono nuevas ventas micro", True),
         ("Bono clientes", True),
         ("Bono día 15", True),
         ("Pase a 90 días", True)]
    },
    {"text":"Sugerencia de qué otra información adicional te gustaría recibir para tu gestión de productividad en el mes 💪🏻(Opcional)",
     "type":"open_ended",
     "options":[]
    }
]

# Preguntas y opciones de Examen 2 (20)
examen2_preguntas = [
    {"text":"Un cliente con 3 días de atraso se clasifica en…",
     "type":"single_choice",
     "options":[
         ("+90", False),
         ("Mora 61–90", False),
         ("Mora 0–30", True),
         ("Cartera al día (0 días)", False)]
    },
    {"text":"¿Cuál acción protege mejor tu indicador de “Cartera al Día”?",
     "type":"single_choice",
     "options":[
         ("Gestionar preventivamente a los próximos a vencer y los 0–8 días de atraso", True),
         ("Esperar que los clientes paguen solos", False),
         ("Solo gestionar clientes +90 días", False)]
    },
    {"text":"En “Pase a 90”, ¿qué caso es más crítico por impacto de penalidad?",
     "type":"single_choice",
     "options":[
         ("Cliente con 92 días de atraso", True),
         ("Cliente con 75 días de atraso", False),
         ("Cliente con 20 días de atraso", False)]
    },
    {"text":"Si tienes 10 clientes y 8 tienen seguros vigentes (excluyendo desgravamen), tu cross selling es:",
     "type":"single_choice",
     "options":[
         ("70%", False),
         ("80%", True),
         ("60%", False),
         ("75%", False)]
    },
    {"text":"Con 10 clientes, ¿cuántos seguros mínimos necesitas para llegar al 75% de cross selling?",
     "type":"single_choice",
     "options":[
         ("6", False),
         ("8", True),
         ("7", False),
         ("9", False)]
    },
    {"text":"“Bono Día 15” se activa cuando el analista está…",
     "type":"single_choice",
     "options":[
         ("Positivo en crecimiento en fechas clave (Día 10/13/15)", True),
         ("Con mora >90 en cero siempre", False),
         ("Negativo al Día 10 y Día 13", False)]
    },
    {"text":"Si activaste factor en Día 15, ¿qué condición debe cumplirse para que sea válido al cierre?",
     "type":"single_choice",
     "options":[
         ("Cumplir el crecimiento mínimo (100% del mínimo) al cierre del mes", True),
         ("Tener 1 seguro vigente", False),
         ("Tener 0 clientes en 31–60", False)]
    },
    {"text":"Si tu crecimiento mínimo es S/ 10,000 y llevas S/ 8,000, tu % de cumplimiento del mínimo es:",
     "type":"single_choice",
     "options":[
         ("80%", True),
         ("70%", False),
         ("90%", False)]
    },
    {"text":"¿Cuál escenario suele aumentar el riesgo de caer en penalidad de “Cartera al Día”?",
     "type":"single_choice",
     "options":[
         ("Dejar acumular atrasos y recién llamar después de varios días", True),
         ("Priorizar 0–8 y 30–60 según riesgo", False),
         ("Gestionar vencimientos antes de la fecha", False)]
    },
    {"text":"Si hoy recuperas 2 créditos en mora 0–30, el efecto esperado en tu cartera es:",
     "type":"single_choice",
     "options":[
         ("Mejora, porque reduces casos con atraso", True),
         ("No cambia nunca", False),
         ("Empeora, porque aumentan los atrasos", False)]
    },
    {"text":"En gestión de riesgo, ¿qué es más preventivo?",
     "type":"single_choice",
     "options":[
         ("Enfocar 0–8 y 30–60 para evitar escalamiento a 61–90 y +90", True),
         ("Enfocar solo +90 (cuando ya ocurrió el daño)", False)]
    },
    {"text":"Si un cliente está en 89 días y no se gestiona, el riesgo inmediato es...",
     "type":"single_choice",
     "options":[
         ("Pasar a +90 y activar penalidad", True),
         ("Volver automáticamente a 0 días", False),
         ("Mejorar tu bono de clientes", False)]
    },
    {"text":"¿Qué variable se asocia más directamente a “calidad / riesgo” dentro del bono?",
     "type":"single_choice",
     "options":[
         ("Pase a 90", True),
         ("Bono Clientes", False),
         ("Cross selling", False)]
    },
    {"text":"¿Cuál variable está más relacionada a “gestión de clientes” (inclusión/actividad)?",
     "type":"single_choice",
     "options":[
         ("Bono Clientes", True),
         ("Pase a 90", False),
         ("Cartera al Día", False)]
    },
    {"text":"Si un reporte muestra tramos 30–60, 61–90 y +90, ¿a qué se refiere?",
     "type":"single_choice",
     "options":[
         ("Segmentación por días de atraso (mora)", True),
         ("Segmentación por tipo de seguro", False),
         ("Segmentación por antigüedad del analista", False)]
    },
    {"text":"Si una alerta te indica “penalidad activa por +90”, la prioridad más lógica es:",
     "type":"single_choice",
     "options":[
         ("Contactar primero los casos +90 por mayor impacto y monto", True),
         ("Ignorar +90 y empezar por 0 días", False),
         ("Esperar a que el sistema lo corrija", False)]
    },
    {"text":"¿Qué afirmación es correcta sobre cross selling en estas fijas?",
     "type":"single_choice",
     "options":[
         ("Se consideran seguros vigentes asociados al stock (excepto desgravamen)", True),
         ("Solo cuentan seguros vendidos por el analista, no por operaciones", False),
         ("Se considera desgravamen dentro del porcentaje", False)]
    },
    {"text":"Si tu indicador de clientes está en 100% y agregas clientes adicionales, el efecto esperado es:",
     "type":"single_choice",
     "options":[
         ("Podrías sumar bonificación por cliente incremental (según tabla)", True),
         ("Pierdes el bono automáticamente", False),
         ("Solo afecta Cartera al Día, no Clientes", False)]
    },
    {"text":"¿Qué combinación es más coherente con “gestión oportuna”?",
     "type":"single_choice",
     "options":[
         ("Revisar alertas + usar detalle + ejecutar gestión durante el mes", True),
         ("Revisar solo cuando hay reclamo", False),
         ("Esperar cierre mensual + gestionar después", False)]
    },
    {"text":"Si en una semana evitaste que 3 clientes caigan en mora gestionando antes del vencimiento, eso es:",
     "type":"single_choice",
     "options":[
         ("Gestión preventiva", True),
         ("Gestión reactiva", False),
         ("Gestión aleatoria", False)]
    }
]

def crear_examenes_mibonito_completo():
    print("Borrando exámenes existentes...")
    Exam.objects.all().delete()
    print("Creando exámenes completos...")

    # --- Examen 1 ---
    examen1 = Exam.objects.create(
        name="Conociendo MiBonito",
        description="Evalúa tu manejo de MiBonito para gestionar bonificaciones y anticipar riesgos.",
        bank_total_questions=20,
        questions_per_attempt=10,
        max_scored_attempts=3,
        max_points=100,
        is_active=True,
        is_enabled=True
    )

    for q in examen1_preguntas:
        pregunta = Question.objects.create(
            exam=examen1,
            text=q["text"],
            points=10,
            time_limit_seconds=60,
            question_type=q["type"]
        )
        options = list(q.get("options", []))
        random.shuffle(options)
        for opt_text, is_correct in options:
            Option.objects.create(question=pregunta, text=opt_text, is_correct=is_correct)

    print(f"Examen 1 '{examen1.name}' creado con éxito. ID: {examen1.id}")

    # --- Examen 2 ---
    examen2 = Exam.objects.create(
        name="Teórico de Productividad",
        description="Evalúa conocimientos sobre gestión de clientes, prevención de riesgos y control de indicadores.",
        bank_total_questions=20,
        questions_per_attempt=10,
        max_scored_attempts=3,
        max_points=100,
        is_active=True,
        is_enabled=True
    )

    for q in examen2_preguntas:
        pregunta = Question.objects.create(
            exam=examen2,
            text=q["text"],
            points=10,
            time_limit_seconds=60,
            question_type=q["type"]
        )
        options = list(q.get("options", []))
        random.shuffle(options)
        for opt_text, is_correct in options:
            Option.objects.create(question=pregunta, text=opt_text, is_correct=is_correct)

    print(f"Examen 2 '{examen2.name}' creado con éxito. ID: {examen2.id}")

if __name__ == "__main__":
    crear_examenes_mibonito_completo()