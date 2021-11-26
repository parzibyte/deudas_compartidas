# deudas

# Documentación
Al clonar proyecto hay que hacer el npm install y crear dos archivos llamados .env.production y .env basándose en el archivo .env.example pero colocando los datos reales de FireBase

# Configurando entorno de desarrollo

- Necesitamos NPM y Node. Si no sabes cómo instalarlos, lee: https://parzibyte.me/blog/2018/09/27/instalar-npm-node-js-windows/

- También necesitas crear un proyecto de Firebase (https://firebase.google.com/?authuser=0) y agregarle Firestore, es decir, crea una base de datos y agrega una app web.

- Ya que tienes la base de datos, agrega la colección llamada usuarios y registra un nuevo usuario con los siguientes datos:

```json
{
    "nombre": "el nombre que quieras",
    "palabraSecreta": "la contraseña hasheada"
}
```

- Para la contraseña hasheada puedes ir a https://bcrypt-generator.com/ y generar una contraseña como `$2a$10$z5l.YBQQX4L9AhUxPT/ekOjXDXelOCWie/Qyxuh83N7BQhZocn/Xa`

 - Ya que andas en Firebase, ve a **Configuración del proyecto** y en **Tus apps** revisa la `firebaseConfig` que se ve algo así:

```js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Aquí van tus datos",
  authDomain: "Aquí van tus datos",
  databaseURL: "Aquí van tus datos",
  projectId: "Aquí van tus datos",
  storageBucket: "Aquí van tus datos",
  messagingSenderId: "Aquí van tus datos",
  appId: "Aquí van tus datos"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```
- Luego clona o descarga este proyecto e instala las dependencias con `npm install`


- Crea 2 archivos, el `.env` y el `.env.production` basándote en `.env.example` y configura las variables del entorno con la firebaseConfig listada más arriba


- Inicia el servidor de desarrollo con `npm run serve` y visita http://localhost:8080



# Compilando para producción

- Ejecutar `npm run build` y esperar a que termine de compilar.

- (Opcional si quieres que sea una PWA): Ejecutar `workbox generateSW workbox-config.js`. Si no sabes qué es esto, lee:  https://parzibyte.me/blog/2021/11/23/crear-publicar-progressive-web-app-convertir-app-web-pwa/

- Copiar todo lo de **dist** (excepto los .map) y servir en un servidor web como Apache o en las Github Pages: https://www.youtube.com/watch?v=wCcd8Tgiktc


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
