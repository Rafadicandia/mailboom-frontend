# Funcionalidad de WhatsApp

Documentación completa del módulo de envío de mensajes por WhatsApp en MailBoom.

## Descripción

Este módulo permite a los usuarios enviar mensajes de WhatsApp utilizando plantillas predefinidas a través de la API de WhatsApp Business. La funcionalidad incluye componentes de interfaz para la selección de plantillas, configuración de parámetros, previsualización y envío de mensajes.

## Estructura de Archivos

```
src/app/features/whatsapp/
├── whatsapp-template-selector/
│   ├── whatsapp-template-selector.component.ts      # Selector de plantillas
│   ├── whatsapp-template-selector.component.html    # Plantilla HTML
│   └── whatsapp-template-selector.component.scss    # Estilos
├── whatsapp-parameter-config/
│   ├── whatsapp-parameter-config.component.ts       # Configuración de parámetros
│   ├── whatsapp-parameter-config.component.html     # Plantilla HTML
│   └── whatsapp-parameter-config.component.scss     # Estilos
├── whatsapp-preview/
│   ├── whatsapp-preview.component.ts                # Previsualización
│   ├── whatsapp-preview.component.html              # Plantilla HTML
│   └── whatsapp-preview.component.scss              # Estilos
├── whatsapp-sender/
│   ├── whatsapp-sender.component.ts                 # Envío de mensajes
│   ├── whatsapp-sender.component.html               # Plantilla HTML
│   └── whatsapp-sender.component.scss               # Estilos
├── index.ts                                         # Exportaciones
└── README.md                                        # Este archivo
```

## Componentes Disponibles

### 1. WhatsappTemplateSelectorComponent

Selector de plantillas de WhatsApp con soporte para múltiples idiomas.

**Selector:** `app-whatsapp-template-selector`

**Inputs:**
- `selectedTemplate: string` - Nombre de la plantilla seleccionada
- `selectedLanguage: string` - Código de idioma (ej: 'es', 'en', 'pt')

**Outputs:**
- `templateChange: EventEmitter<{templateName: string, languageCode: string}>` - Emitido al seleccionar plantilla
- `languageChange: EventEmitter<string>` - Emitido al cambiar idioma

**Uso:**
```html
<app-whatsapp-template-selector
  [selectedTemplate]="'bienvenida'"
  [selectedLanguage]="'es'"
  (templateChange)="onTemplateChange($event)"
  (languageChange)="onLanguageChange($event)"
></app-whatsapp-template-selector>
```

### 2. WhatsappParameterConfigComponent

Configuración de parámetros dinámicos para plantillas de WhatsApp.

**Selector:** `app-whatsapp-parameter-config`

**Inputs:**
- `template: TemplateInfo | null` - Plantilla seleccionada
- `parameters: TemplateParameter[]` - Parámetros actuales

**Outputs:**
- `parametersChange: EventEmitter<TemplateParameter[]>` - Emitido al cambiar parámetros

**Tipos de Parámetros Soportados:**
- `text` - Texto simple
- `currency` - Moneda (código y monto)
- `date_time` - Fecha y hora
- `image` - Imagen (URL)
- `document` - Documento (URL)
- `video` - Video (URL)
- `location` - Ubicación (latitud, longitud)

**Uso:**
```html
<app-whatsapp-parameter-config
  [template]="selectedTemplate"
  [parameters]="currentParameters"
  (parametersChange)="onParametersChange($event)"
></app-whatsapp-parameter-config>
```

### 3. WhatsappPreviewComponent

Previsualización del mensaje de WhatsApp antes del envío.

**Selector:** `app-whatsapp-preview`

**Inputs:**
- `template: TemplateInfo | null` - Plantilla seleccionada
- `parameters: TemplateParameter[]` - Parámetros configurados
- `phoneNumber: string` - Número de destino
- `languageCode: string` - Código de idioma

**Outputs:**
- `send: EventEmitter<void>` - Emitido al enviar
- `edit: EventEmitter<void>` - Emitido al editar

**Uso:**
```html
<app-whatsapp-preview
  [template]="selectedTemplate"
  [parameters]="currentParameters"
  [phoneNumber]="'+5491112345678'"
  [languageCode]="'es'"
  (send)="onSend()"
  (edit)="onEdit()"
></app-whatsapp-preview>
```

### 4. WhatsappSenderComponent

Componente completo para envío de mensajes por WhatsApp.

**Selector:** `app-whatsapp-sender`

**Uso:**
```html
<app-whatsapp-sender></app-whatsapp-sender>
```

## Componente Integrado: WhatsappStepComponent

Componente que integra todos los componentes anteriores en un flujo de múltiples pasos para el Campaign Wizard.

**Selector:** `app-whatsapp-step`

**Inputs:**
- `campaignType: string` - Tipo de campaña (default: 'email')

**Outputs:**
- `stepComplete: EventEmitter<{valid: boolean, data: any}>` - Emitido al completar el paso
- `stepChange: EventEmitter<number>` - Emitido al cambiar de paso

**Flujo de Trabajo:**
1. **Selección** - Elige una plantilla y el idioma
2. **Configuración** - Configura los parámetros y el número de destino
3. **Previsualización** - Revisa el mensaje antes de enviar

**Uso en Campaign Wizard:**
```html
<app-whatsapp-step
  [campaignType]="'whatsapp'"
  (stepComplete)="onStepComplete($event)"
  (stepChange)="onStepChange($event)"
></app-whatsapp-step>
```

## Modelos de Datos

### SendTemplateMessageRequest
```typescript
{
  to: string;                    // Número de WhatsApp (formato E.164)
  templateName: string;          // Nombre de la plantilla
  languageCode: string;          // Código de idioma (ej: 'es', 'en')
  parameters?: TemplateParameter[]; // Parámetros opcionales
}
```

### TemplateParameter
- **type**: Tipo de parámetro (`text` | `currency` | `date_time` | `image` | `document` | `video` | `location`)
- Propiedades específicas según el tipo

### TemplateInfo
```typescript
{
  name: string;                  // Nombre de la plantilla
  language: string;              // Idioma de la plantilla
  category: string;              // Categoría (UTILITY, MARKETING, etc.)
  status: 'approved' | 'pending' | 'rejected';
  components: TemplateComponent[]; // Componentes de la plantilla
}
```

## Plantillas Disponibles (Mock)

1. **bienvenida** (UTILITY)
   - Texto: "Hola {{1}}, bienvenido a nuestro servicio. Tu código de verificación es {{2}}."
   - Parámetros: 2 (nombre, código)

2. **notificacion_pedido** (UTILITY)
   - Texto: "Estimado {{1}}, su pedido #{{2}} ha sido confirmado. Total: {{3}}."
   - Parámetros: 3 (nombre, número de pedido, total)

3. **recordatorio** (MARKETING)
   - Texto: "Hola {{1}}, te recordamos que tienes una cita pendiente el {{2}} a las {{3}}."
   - Parámetros: 3 (nombre, fecha, hora)

4. **promocion_especial** (MARKETING)
   - Texto: "Hola {{1}}, aprovecha nuestra promoción exclusiva con {{2}}% de descuento. Válido hasta {{3}}."
   - Parámetros: 3 (nombre, porcentaje, fecha)

## Integración con Campaign Wizard

Los componentes de WhatsApp están diseñados para integrarse en el Campaign Wizard existente. El componente `WhatsappStepComponent` proporciona una experiencia de usuario completa en tres pasos:

1. **Selección de Plantilla** - Muestra plantillas disponibles con filtro por idioma
2. **Configuración de Parámetros** - Permite configurar parámetros dinámicos según la plantilla
3. **Vista Previa** - Muestra cómo se verá el mensaje antes del envío

## Estilos y Temas

Todos los componentes utilizan Tailwind CSS para el diseño y siguen las mismas convenciones de estilo que el resto de la aplicación:

- Colores principales: Verde (#10b981) para acciones principales
- Esquema de colores consistente con el diseño del Campaign Wizard
- Diseño responsive para dispositivos móviles y de escritorio
- Animaciones y transiciones suaves para mejorar la experiencia de usuario

## Internacionalización

Los componentes soportan múltiples idiomas:
- Español (`es`) - Región: ES
- Inglés (`en`) - Región: US
- Portugués (`pt`) - Región: BR

## Validaciones

- **Número de teléfono**: Debe coincidir con el patrón E.164 (`/^+?[1-9]\d{1,14}$/`)
- **Plantilla**: Debe estar seleccionada y aprobada
- **Parámetros**: Todos los parámetros requeridos deben estar completos
- **Formulario**: No se permite envío si el formulario es inválido