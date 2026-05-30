export class CreatePaymentPreferenceUseCase {
  // En el futuro, acá inyectamos el cliente de MercadoPago (SDK)
  async execute(userId: string, amount: number): Promise<{ init_point: string }> {
    console.log(`💳 Creando preferencia de pago para el usuario: ${userId} por $${amount}`);

    // SIMULACIÓN: En un entorno real, acá llamarías al SDK de MercadoPago
    // ej: const preference = await mercadopago.preferences.create({ ... });
    
    return {
      init_point: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=SIMULADO-123456"
    };
  }
}