# Medical Appointment API

API Serverless para gestión de citas médicas, desarrollada como reto técnico.  
El proyecto sigue principios de arquitectura hexagonal y está desplegado en AWS.

## 🚀 Despliegue

- **Swagger UI (Documentación):** [https://8hz41jjtu1.execute-api.us-east-1.amazonaws.com/dev/docs](https://8hz41jjtu1.execute-api.us-east-1.amazonaws.com/dev/docs)
- **OpenAPI Spec (YAML):** [https://8hz41jjtu1.execute-api.us-east-1.amazonaws.com/dev/docs/openapi.yaml](https://8hz41jjtu1.execute-api.us-east-1.amazonaws.com/dev/docs/openapi.yaml)

## 📌 Funcionalidades

- `POST /appointments` → Crear cita médica
- `GET /appointments/{insuredId}` → Listar citas por asegurado
- Procesadores asíncronos por país (PE, CL) con SQS
- Actualización de estado de citas vía cola de completados

## 🛠️ Tecnologías

- Node.js + TypeScript
- AWS Lambda, API Gateway, SQS, EventBridge, DynamoDB, RDS
- Serverless Framework
- Swagger UI para documentación
- Jest para testing

## ▶️ Uso local

```bash
yarn install
sls offline
```
