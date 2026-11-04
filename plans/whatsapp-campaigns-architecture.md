# Arquitectura e Implementación: Campañas de WhatsApp

## Resumen del Proyecto
Integración de funcionalidad de campañas masivas de WhatsApp en el Campaign Wizard existente, manteniendo el flujo de email sin cambios.

## Análisis del Sistema Actual

### 1. Campaign Wizard (src/app/features/campaigns/campaign-wizard/)
- **Flujo actual**: 4 pasos (Config → Design → Audience → Review)
- **Modelo**: EmailDesign, NewCampaignRequest
- **Servicio**: CampaignService
- **Estado**: Solo soporta campañas de email

### 2. WhatsApp Sender (src/app/features/whatsapp/whatsapp-sender/)
- **Componente**: WhatsappSenderComponent
- **Modelo**: SendTemplateMessageRequest, TemplateInfo
- **Servicio**: AdminService (sendTemplateMessage)
- **Estado**: Envíos individuales, no campañas masivas

### 3. Modelos Existentes
- **Campaign**: id, ownerId, subject, htmlContent, sender, recipientListId, status
- **SendTemplateMessageRequest**: to, templateName, languageCode, parameters
- **NewCampaignRequest**: ownerId, subject, htmlContent, sender, recipientListId

## Arquitectura Propuesta

### 1. Extensión de Modelos

#### Nuevo Modelo: WhatsAppCampaign
```typescript
// src/app/core/models/whatsapp-campaign.model.ts
export interface WhatsAppCampaign {
  id: string;
  ownerId: string;
  templateId: string;
  templateName: string;
  recipientListId: string;
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
  totalRecipients: number;
  parameters?: TemplateParameter[];
}

export interface NewWhatsAppCampaignRequest {
  ownerId: string;
  templateId: string;
  templateName: string;
  recipientListId: string;
  parameters?: TemplateParameter[];
}

export interface SendWhatsAppCampaignRequest {
  campaignId: string;
  ownerId: string;
}
```

#### Extensión de Campaign (polimorfismo)
```typescript
export type CampaignType = 'EMAIL' | 'WHATSAPP';

export interface Campaign {
  id: string;
  ownerId: string;
  type: CampaignType;  // NUEVO
  subject?: string;    // Para email
  htmlContent?: string; // Para email
  sender?: string;     // Para email
  templateId?: string; // Para WhatsApp
  templateName?: string; // Para WhatsApp
  recipientListId: string;
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
  parameters?: TemplateParameter[]; // Para WhatsApp
}
```

### 2. Modificaciones al Campaign Wizard

#### Paso 1: Configuración (campaign-wizard.component.ts)
**Cambios necesarios:**
- Agregar selector de tipo: Email / WhatsApp
- Mostrar campos según el tipo seleccionado
- Para Email: subject, fromDisplayName (actual)
- Para WhatsApp: template selector (nuevo)

**Template selector:**
- Dropdown con plantillas disponibles
- Preview del template seleccionado
- Mostrar placeholders requeridos

#### Nuevo Componente: WhatsAppTemplateSelector
```typescript
// src/app/features/campaigns/campaign-wizard/steps/template-selector.component.ts
- Input: templates[]
- Output: templateSelected
- Mostrar lista de templates con preview
- Validar placeholders requeridos
```

#### Paso 2: Diseño
- **Email**: Editor actual (sin cambios)
- **WhatsApp**: Solo lectura de template seleccionado
  - Mostrar preview del template
  - Mostrar campos de parámetros dinámicos
  - Input para cada placeholder {{1}}, {{2}}, etc.

#### Paso 3: Audiencia
- Sin cambios (reutilizar componente actual)

#### Paso 4: Revisión
- Mostrar preview según tipo
- Email: preview HTML actual
- WhatsApp: preview del template con parámetros

### 3. Servicios

#### CampaignService (Extensiones)
```typescript
// Nuevos métodos
createWhatsAppCampaign(request: NewWhatsAppCampaignRequest): Observable<WhatsAppCampaign>
updateWhatsAppCampaign(id: string, request: NewWhatsAppCampaignRequest): Observable<WhatsAppCampaign>
sendWhatsAppCampaign(campaignId: string, ownerId: string): Observable<void>
getWhatsAppTemplates(): Observable<TemplateInfo[]>
```

#### AdminService (Extensiones)
```typescript
// Ya tiene sendTemplateMessage para individual
// Necesario: sendWhatsAppCampaign para masivo
sendWhatsAppCampaign(request: SendWhatsAppCampaignRequest): Observable<void>
getTemplates(): Observable<TemplateInfo[]>  // Ya existe pero comentado
```

### 4. Flujo de Usuario

#### Para Campañas de Email (Actual - Sin cambios)
1. Paso 1: Config → Asunto, Remitente
2. Paso 2: Design → Editor de contenido
3. Paso 3: Audience → Seleccionar lista
4. Paso 4: Review → Previsualizar y enviar

#### Para Campañas de WhatsApp (Nuevo)
1. Paso 1: Config → Seleccionar tipo: WhatsApp
   - Mostrar dropdown de templates disponibles
   - Seleccionar template
2. Paso 2: Design → Configurar parámetros
   - Mostrar preview del template
   - Input para cada placeholder {{1}}, {{2}}, etc.
   - Validar campos requeridos
3. Paso 3: Audience → Seleccionar lista de contactos
   - Validar que los contactos tengan WhatsApp
4. Paso 4: Review → Confirmar envío
   - Mostrar template con parámetros
   - Mostrar cantidad de destinatarios
   - Botón: Enviar Campaña

### 5. Componentes Nuevos

#### WhatsAppTemplateSelectorComponent
```
Selector de templates con preview
- Lista de templates disponibles
- Preview del template seleccionado
- Muestra placeholders requeridos
```

#### WhatsAppParameterConfigComponent
```
Configuración de parámetros del template
- Input para cada placeholder
- Validación según tipo (text, currency, date_time, etc.)
- Preview en tiempo real
```

#### WhatsAppPreviewComponent
```
Preview del mensaje WhatsApp
- Muestra cómo se verá el mensaje
- Reemplaza placeholders con valores
```

### 6. Rutas

**Actual:**
- `/campaigns/new` - Campaign Wizard (solo email)

**Nuevo:**
- `/campaigns/new?type=email` - Wizard con email (default)
- `/campaigns/new?type=whatsapp` - Wizard con WhatsApp
- `/whatsapp/send` - WhatsApp Sender individual (ya existe)

### 7. Integración con Backend

#### Endpoints necesarios:
```
POST /api/campaigns/whatsapp/new
  Body: NewWhatsAppCampaignRequest
  Response: WhatsAppCampaign

PUT /api/campaigns/whatsapp/{id}/update
  Body: NewWhatsAppCampaignRequest
  Response: WhatsAppCampaign

POST /api/campaigns/whatsapp/{id}/send
  Body: SendWhatsAppCampaignRequest
  Response: void

GET /api/templates
  Response: TemplateInfo[]
```

#### Backend Flow para WhatsApp Campaign:
1. Crear campaña con template y parámetros
2. Por cada contacto en la lista:
   - Extraer phoneNumber
   - Enviar SendTemplateMessageRequest individual
   - Trackear status por contacto
3. Actualizar status de campaña

### 8. Consideraciones Técnicas

#### State Management
- Usar signals (como el sistema actual)
- Mantener tipo de campaña en estado global del wizard
- Resetear estado al cambiar de tipo

#### Validaciones
- Email: subject, fromDisplayName, htmlContent
- WhatsApp: templateId, parameters (según template)

#### UI/UX
- Mostrar claramente el tipo seleccionado
- Preview en tiempo real
- Validaciones amigables
- Mantener consistencia con diseño actual

#### Testing
- Unit tests para nuevos componentes
- Integration tests para el wizard
- E2E tests para ambos flujos

## Plan de Implementación

### Fase 1: Modelos y Servicios (1 día)
- [ ] Crear modelos WhatsAppCampaign
- [ ] Extender Campaign model con type
- [ ] Agregar métodos a CampaignService
- [ ] Agregar métodos a AdminService

### Fase 2: Componentes (2 días)
- [ ] WhatsAppTemplateSelectorComponent
- [ ] WhatsAppParameterConfigComponent
- [ ] WhatsAppPreviewComponent

### Fase 3: Integración Wizard (2 días)
- [ ] Modificar Paso 1: Agregar selector tipo
- [ ] Modificar Paso 2: Soporte WhatsApp
- [ ] Modificar Paso 4: Preview WhatsApp
- [ ] Lógica de submit según tipo

### Fase 4: Backend Integration (1 día)
- [ ] Conectar con endpoints
- [ ] Manejo de errores
- [ ] Testing

### Fase 5: Testing y QA (1 día)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] QA manual

## Riesgos y Mitigaciones

### Riesgo 1: Backend no soporta campañas masivas WhatsApp
**Mitigación**: Implementar loop en frontend (enviar individual)

### Riesgo 2: Templates dinámicos complejos
**Mitigación**: Limitar a placeholders simples {{1}}, {{2}}, etc.

### Riesgo 3: Performance con listas grandes
**Mitigación**: Paginación, batch processing

## Éxito del Proyecto

- [ ] Usuario puede crear campaña Email (actual) - funcionando
- [ ] Usuario puede crear campaña WhatsApp (nuevo)
- [ ] Flujo claro y sin confusiones
- [ ] Preview preciso
- [ ] Envío exitoso
- [ ] Tracking de status
