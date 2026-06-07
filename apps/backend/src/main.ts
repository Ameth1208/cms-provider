import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  // CORS completamente abierto - API pública para múltiples frontends
  app.enableCors({
    origin: true, // Permitir cualquier origen
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'api-key', 'X-Requested-With', 'Accept', 'Origin'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('CMS Web Manager API')
    .setDescription('API para gestión de contenido, catálogo, pedidos e inventario')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  app.use('/api/docs', apiReference({ spec: { content: document } }))

  const port = process.env.PORT || 4002
  await app.listen(port)
  console.log(`API running on http://localhost:${port}/api`)
  console.log(`API Docs on http://localhost:${port}/api/docs`)
}

bootstrap()
