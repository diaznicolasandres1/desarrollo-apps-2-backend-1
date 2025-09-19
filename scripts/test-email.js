/**
 * Script de prueba para verificar la configuración de email
 * Ejecutar con: node scripts/test-email.js
 */

const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('🧪 Probando configuración de email...\n');

  // Verificar variables de entorno
  const requiredVars = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
    console.log('\n📝 Asegúrate de configurar las siguientes variables en tu archivo .env:');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_USER=tu-email@gmail.com');
    console.log('EMAIL_PASS=tu-contraseña-de-aplicacion');
    console.log('EMAIL_FROM=noreply@ticketsapp.com');
    return;
  }

  // Crear transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Verificar conexión
    console.log('🔗 Verificando conexión al servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexión exitosa al servidor SMTP\n');

    // Generar código QR de prueba (simulando el pre-save hook)
    console.log('🔲 Generando código QR de prueba...');
    const testTicketId = '507f1f77bcf86cd799439011'; // ID de ejemplo
    const testValidationURL = `https://desarrollo-apps-2-frontend.vercel.app/ticket_id/${testTicketId}/use`;
    const qrCodeDataURL = await QRCode.toDataURL(testValidationURL, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ Código QR generado exitosamente (simulando pre-save hook)\n');

    // Enviar email de prueba
    console.log('📧 Enviando email de prueba...');
    const testEmail = process.env.EMAIL_USER; // Enviar a la misma dirección
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: testEmail,
      subject: '🧪 Prueba de Configuración - Sistema de Tickets con QR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">✅ Configuración de Email Exitosa</h2>
          <p>¡Felicitaciones! Tu configuración de email está funcionando correctamente.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Detalles de la configuración:</h3>
            <ul>
              <li><strong>Servidor SMTP:</strong> ${process.env.EMAIL_HOST}</li>
              <li><strong>Puerto:</strong> ${process.env.EMAIL_PORT}</li>
              <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>Desde:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</li>
            </ul>
          </div>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>🔲 Código QR de Prueba</h3>
            <p><strong>URL de validación:</strong> ${testValidationURL}</p>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${qrCodeDataURL}" alt="Código QR de prueba" style="border: 2px solid #ddd; border-radius: 5px;" />
            </div>
            <p style="font-size: 0.9em; color: #666;">
              Este es un código QR de ejemplo que se genera automáticamente al crear tickets (pre-save hook).
            </p>
          </div>
          
          <p>Ahora puedes realizar compras de tickets y recibirás emails de confirmación con códigos QR generados automáticamente por el pre-save hook.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 0.9em;">
            Este es un email de prueba enviado por el sistema de tickets.
          </p>
        </div>
      `,
    });

    console.log('✅ Email de prueba enviado exitosamente');
    console.log('📬 Revisa tu bandeja de entrada (y carpeta de spam)');
    console.log(`📧 Message ID: ${info.messageId}\n`);

  } catch (error) {
    console.error('❌ Error al enviar email de prueba:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Posibles soluciones:');
      console.log('- Verifica que EMAIL_USER y EMAIL_PASS sean correctos');
      console.log('- Para Gmail, asegúrate de usar una contraseña de aplicación');
      console.log('- Habilita la verificación en 2 pasos en tu cuenta de Google');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Posibles soluciones:');
      console.log('- Verifica que EMAIL_HOST y EMAIL_PORT sean correctos');
      console.log('- Algunos proveedores bloquean conexiones desde servidores de desarrollo');
    }
  }
}

// Ejecutar prueba
testEmailConfiguration().catch(console.error);
