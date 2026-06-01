import 'dotenv/config';
import { Partner } from './src/modules/partners/domain/entities/Partner.js';
import { Coupon } from './src/modules/partners/domain/entities/Coupon.js';
import { PrismaPartnerRepository } from './src/modules/partners/infrastructure/persistence/PrismaPartnerRepository.js';

async function test() {
  console.log('🚀 Iniciando test del módulo de Partners...');
  const repo = new PrismaPartnerRepository();

  // 1. Instanciamos la Entidad del Partner (Sanfrí LT)
  const partnerId = "f11a4321-bbbb-4444-aaaa-1234567890ab";
  const nuevoPartner = new Partner({
    id: partnerId,
    name: 'Sanfrí LT',
    category: 'Indumentaria',
    logoUrl: 'https://sanfri.com/logo.png',
    isActive: true
  });

  console.log('💾 Guardando Partner...');
  await repo.savePartner(nuevoPartner);
  console.log('✅ Partner guardado con éxito.');

  // 2. Instanciamos la Entidad de un Cupón asociado a ese Partner
  const nuevoCupon = new Coupon({
    id: "c99a8765-dddd-2222-1111-abcdefabcdef",
    partnerId: partnerId,
    code: 'SANFRI20',
    description: '20% de descuento en toda la tienda para alumnos activos.',
    discountPercentage: 20,
    expirationDate: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true
  });

  console.log('💾 Guardando Cupón comercial...');
  await repo.saveCoupon(nuevoCupon);
  console.log('✅ Cupón guardado con éxito.');

  // 3. Probamos la lectura completa: Buscar todos los partners activos con sus cupones
  console.log('🔍 Recuperando catálogo de beneficios activos de la base de datos...');
  const catalogo = await repo.findAllActivePartners();

  console.log('\n📊 RESULTADO EN BASE DE DATOS:');
  console.log(JSON.stringify(catalogo, null, 2));
}

test()
  .catch((e) => {
    console.error('🔴 Error en el test de partners:', e);
  })
  .finally(() => {
    process.exit(0);
  });