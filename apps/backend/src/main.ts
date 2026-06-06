import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : []

  // En desarrollo, aceptar cualquier localhost/127.0.0.1
  const isLocalhost = (origin: string) =>
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, server-to-server, mobile apps)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      if (isLocalhost(origin)) return callback(null, true)
      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'api-key'],
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
