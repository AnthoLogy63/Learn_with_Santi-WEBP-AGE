export interface Question {
  id: number;
  text: string;
  type: "multiple" | "boolean";
  options: string[];
  correctAnswer: number;
  section: string;
}

export const examQuestions: Record<string, Question[]> = {
  "mi-bonito": [
    { id: 1, text: "¿Cuál es el objetivo principal de la herramienta 'Mi Bonito'?", type: "multiple", options: ["Gestión de inventarios", "Análisis financiero de clientes", "Diseño gráfico", "Gestión de recursos humanos"], correctAnswer: 1, section: "Conocimiento General" },
    { id: 2, text: "¿Mi Bonito permite generar reportes automáticos?", type: "boolean", options: ["Verdadero", "Falso"], correctAnswer: 0, section: "Conocimiento General" },
    { id: 3, text: "¿Cuál módulo se usa para consultar el historial de un cliente?", type: "multiple", options: ["Módulo de cobros", "Módulo de consultas", "Módulo de ventas", "Módulo de marketing"], correctAnswer: 1, section: "Conocimiento General" },
    { id: 4, text: "¿Qué tipo de datos maneja principalmente Mi Bonito?", type: "multiple", options: ["Datos de redes sociales", "Datos financieros y crediticios", "Datos de logística", "Datos de manufactura"], correctAnswer: 1, section: "Conocimiento General" },
    { id: 5, text: "¿Se puede acceder a Mi Bonito desde dispositivos móviles?", type: "boolean", options: ["Verdadero", "Falso"], correctAnswer: 0, section: "Conocimiento General" },
  ],
  "matematicas": [
    { id: 1, text: "Si un cliente tiene una mora del 5% mensual sobre $1000, ¿cuánto debe pagar de interés después de 3 meses?", type: "multiple", options: ["$50", "$150", "$157.63", "$100"], correctAnswer: 2, section: "Cálculo de Mora" },
    { id: 2, text: "Una bonificación del 10% sobre un saldo de $5000 equivale a $500.", type: "boolean", options: ["Verdadero", "Falso"], correctAnswer: 0, section: "Bonificación" },
    { id: 3, text: "¿Cuál es la tasa efectiva anual si la tasa mensual es del 2%?", type: "multiple", options: ["24%", "26.82%", "12%", "20%"], correctAnswer: 1, section: "Análisis de Variables" },
    { id: 4, text: "Si un préstamo de $10,000 se paga en 12 cuotas iguales con interés simple del 1% mensual, ¿cuánto es cada cuota aproximadamente?", type: "multiple", options: ["$833.33", "$933.33", "$883.33", "$1000"], correctAnswer: 1, section: "Cálculo de Mora" },
    { id: 5, text: "El valor presente siempre es mayor que el valor futuro.", type: "boolean", options: ["Verdadero", "Falso"], correctAnswer: 1, section: "Análisis de Variables" },
  ],
  "economia": [
    { id: 1, text: "¿Qué indicador mide el nivel general de precios en una economía?", type: "multiple", options: ["PIB", "IPC", "TRM", "ROI"], correctAnswer: 1, section: "Economía General" },
    { id: 2, text: "La inflación reduce el poder adquisitivo del dinero.", type: "boolean", options: ["Verdadero", "Falso"], correctAnswer: 0, section: "Economía General" },
    { id: 3, text: "¿Qué ratio financiero mide la capacidad de pago a corto plazo?", type: "multiple", options: ["ROE", "Ratio de liquidez corriente", "Ratio de endeudamiento", "Margen neto"], correctAnswer: 1, section: "Análisis Financiero" },
    { id: 4, text: "¿Cuál es el principal riesgo de otorgar crédito sin análisis previo?", type: "multiple", options: ["Mayor rentabilidad", "Pérdida por morosidad", "Incremento del PIB", "Reducción de costos"], correctAnswer: 1, section: "Análisis Financiero" },
    { id: 5, text: "El análisis de riesgo crediticio es opcional en instituciones financieras.", type: "boolean", options: ["Verdadero", "Falso"], correctAnswer: 1, section: "Análisis Financiero" },
  ],
};
