# 🏥 Medical Appointment System - Backend Challenge

Sistema backend serverless para agendamiento de citas médicas de asegurados en Perú (PE) y Chile (CL), desarrollado como solución al reto técnico Backend Node.js/AWS Developer.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración de Base de Datos](#-configuración-de-base-de-datos)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Arquitectura del Código](#-arquitectura-del-código)
- [Monitoreo y Logs](#-monitoreo-y-logs)
- [Limpieza](#-limpieza)

---

## 🏗️ Arquitectura

Sistema **event-driven** usando servicios serverless de AWS:

### Flujo de Datos

```
1. Cliente → POST /appointments → API Gateway
                                      ↓
2. Lambda (createAppointment) → DynamoDB [status: pending]
                                      ↓
3. Lambda → SNS Topic (con filtro por país)
                                      ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
   SQS_PE (PE)                         SQS_CL (CL)
        ↓                                   ↓
Lambda PE Processor              Lambda CL Processor
        ↓                                   ↓
   RDS MySQL PE                       RDS MySQL CL
        └─────────────────┬─────────────────┘
                          ↓
                   EventBridge Bus
                          ↓
              SQS Completion Queue
                          ↓
          Lambda (statusUpdater)
                          ↓
            DynamoDB [status: completed]
                          ↓
5. Cliente → GET /appointments/{insuredId} → Listado completo
```
