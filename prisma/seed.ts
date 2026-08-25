import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- CATÁLOGO DE FUERZA TRADICIONAL Y POLEAS ---
const pecho = [
  { name: 'Press de Banca Plano con Barra', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Press de Banca Inclinado con Barra', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Press de Banca Declinado con Barra', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Press Plano con Mancuernas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Press Declinado con Mancuernas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Aperturas Planas con Mancuernas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Aperturas Inclinadas con Mancuernas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Aperturas en Pec Deck', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Cruce de Poleas Altas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Cruce de Poleas Bajas', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Press de Pecho en Máquina Hammer', muscle_group: 'Pecho', is_custom: false, gym_id: null },
  { name: 'Pullover con Mancuerna', muscle_group: 'Pecho', is_custom: false, gym_id: null }
];

const espalda = [
  { name: 'Dominadas Pronas (Agarre Ancho)', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Dominadas Supinas (Chin-ups)', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Jalón al Pecho en Polea Alta', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Jalón con Agarre Neutro/Supino', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Remo con Barra', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Remo con Mancuerna a un Brazo', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Remo en Barra T con Apoyo', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Remo Gironda (Polea Baja Agarre Estrecho)', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Remo Alto en Máquina', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Pull-Over en Polea Alta con Barra Recta', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Pull-Over en Polea Alta con Soga', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Extensiones Lumbares en Banco Romano', muscle_group: 'Espalda', is_custom: false, gym_id: null },
  { name: 'Peso Muerto Convencional con Barra', muscle_group: 'Espalda', is_custom: false, gym_id: null }
];

const piernas = [
  { name: 'Sentadilla Libre Trasera con Barra', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Sentadilla Frontal con Barra', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Prensa Atlética 45 Grados', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Hack Squat (Sentadilla Hack)', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Sillón de Extensiones de Cuádriceps', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Curl de Isquiotibiales Acostado', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Curl de Isquiotibiales Sentado', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Peso Muerto Rumano con Barra', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Peso Muerto Rumano con Mancuernas', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Hip Thrust con Barra', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Estocadas Caminando con Mancuernas', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Sentadilla Búlgara con Mancuernas', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Aductores en Máquina', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Abductores en Máquina (Glúteo Medio)', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Elevación de Talones Sentado (Gemelos)', muscle_group: 'Piernas', is_custom: false, gym_id: null },
  { name: 'Elevación de Talones de Pie (Gemelos)', muscle_group: 'Piernas', is_custom: false, gym_id: null }
];

const hombros = [
  { name: 'Press Militar de Pie con Barra', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Press Arnold con Mancuernas', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Press de Hombros Sentado con Mancuernas', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Vuelos Laterales con Mancuernas', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Vuelos Laterales en Polea Baja', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Pájaros con Mancuernas (Deltoides Posterior)', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Pájaros en Pec Deck Invertido', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Elevaciones Frontales con Mancuernas', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Elevaciones Frontales con Disco', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Remo al Mentón con Barra Z', muscle_group: 'Hombros', is_custom: false, gym_id: null },
  { name: 'Encogimientos de Hombros con Mancuernas (Trapecio)', muscle_group: 'Hombros', is_custom: false, gym_id: null }
];

const brazos = [
  { name: 'Curl de Bíceps con Barra W / Z', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Curl de Bíceps con Barra Recta', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Curl Martillo con Mancuernas', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Curl Inclinado con Mancuernas (Banco 45)', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Curl Concentrado con Mancuerna', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Curl de Bíceps en Banco Scott (Predicador)', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Curl de Bíceps Invertido con Barra (Antebrazo)', muscle_group: 'Bíceps', is_custom: false, gym_id: null },
  { name: 'Extensión de Tríceps en Polea Alta con Soga', muscle_group: 'Tríceps', is_custom: false, gym_id: null },
  { name: 'Extensión de Tríceps en Polea con Barra Recta', muscle_group: 'Tríceps', is_custom: false, gym_id: null },
  { name: 'Fondos en Paralelas para Tríceps', muscle_group: 'Tríceps', is_custom: false, gym_id: null },
  { name: 'Press de Banca Agarre Estrecho', muscle_group: 'Tríceps', is_custom: false, gym_id: null },
  { name: 'Rompecráneos (Press Francés con Barra Z)', muscle_group: 'Tríceps', is_custom: false, gym_id: null },
  { name: 'Extensión de Tríceps tras Nuca con Mancuerna', muscle_group: 'Tríceps', is_custom: false, gym_id: null },
  { name: 'Patada de Tríceps con Mancuerna', muscle_group: 'Tríceps', is_custom: false, gym_id: null }
];

// --- 🎯 ARSENAL DE ABDOMINALES, CORE Y CALISTENIA ---
const core = [
  { name: 'Crunch Abdominal en Colchoneta', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Crunch Abdominal con Carga (Disco)', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Crunch en Polea Alta (Arrodillado)', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Elevación de Piernas en Colchoneta', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Elevación de Rodillas Suspendido (Silla de Capitán)', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Elevación de Piernas Colgado en Barra (Toes to Bar)', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Plancha Isométrica Frontal (Plank)', muscle_group: 'Core', is_custom: false, gym_id: null },
  { name: 'Plancha Lateral Isométrica', muscle_group: 'Core', is_custom: false, gym_id: null },
  { name: 'Giros Rusos (Russian Twists) con Peso', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Abdominales Bicicleta (Air Bike Crunches)', muscle_group: 'Abdominales', is_custom: false, gym_id: null },
  { name: 'Bicho Muerto (Dead Bug)', muscle_group: 'Core', is_custom: false, gym_id: null },
  { name: 'Rueda Abdominal (Ab Wheel Rollout)', muscle_group: 'Core', is_custom: false, gym_id: null },
  { name: 'Leñador en Polea Media (Woodchopper)', muscle_group: 'Core', is_custom: false, gym_id: null },
  { name: 'Vacío Abdominal (Hipopresivos)', muscle_group: 'Core', is_custom: false, gym_id: null }
];

const funcional_cardio = [
  { name: 'Flexiones de Brazo (Push-ups)', muscle_group: 'Peso Corporal', is_custom: false, gym_id: null },
  { name: 'Flexiones de Brazo Diamante', muscle_group: 'Peso Corporal', is_custom: false, gym_id: null },
  { name: 'Burpees Estándar', muscle_group: 'Cardio', is_custom: false, gym_id: null },
  { name: 'Escaladores (Mountain Climbers)', muscle_group: 'Cardio', is_custom: false, gym_id: null },
  { name: 'Saltos al Cajón (Box Jumps)', muscle_group: 'Cardio', is_custom: false, gym_id: null },
  { name: 'Kettlebell Swings (Balanceo)', muscle_group: 'Cardio', is_custom: false, gym_id: null },
  { name: 'Salto a la Soga', muscle_group: 'Cardio', is_custom: false, gym_id: null },
  { name: 'Remo en Ergosómetro', muscle_group: 'Cardio', is_custom: false, gym_id: null },
  { name: 'Sentadillas al Aire (Air Squats)', muscle_group: 'Peso Corporal', is_custom: false, gym_id: null }
];

// Unificamos absolutamente todo el arsenal en un mega array plano
const allExercises = [
  ...pecho,
  ...espalda,
  ...piernas,
  ...hombros,
  ...brazos,
  ...core,
  ...funcional_cardio
];

async function main() {
  console.log('🌱 Empezando el sembrado de datos reales masivos...');

  console.log('🧹 Limpiando datos viejos para evitar conflictos estructurales...');
  await prisma.training_Log.deleteMany({});
  await prisma.routine_Exercise.deleteMany({});
  await prisma.routine.deleteMany({});
  await prisma.exercise.deleteMany({});

  console.log(`🏋️ Inyectando catálogo definitivo de ${allExercises.length} ejercicios del sistema...`);

  await prisma.exercise.createMany({
    data: allExercises
  });

  console.log('✅ Base de datos sembrada con éxito con el catálogo profesional.');
}

main()
  .catch((e) => {
    console.error('🔴 Error en el seed masivo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });