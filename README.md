# Práctica de Laboratorio: Análisis y Explotación de Vulnerabilidad SQL Injection (SQLi)

**Institución:** Escuela Superior de Cómputo (ESCOM) - IPN
**Materia:** Bases de Datos
**Alumno:** Emir Adrian Hernandez Castillo (emir@escom.com)

## Resumen

Este repositorio contiene un entorno de pruebas controlado e intencionalmente vulnerable, diseñado para estudiar la mecánica de un ataque de Inyección SQL (SQLi) de tipo basado en formularios. Adicionalmente, se documenta la metodología estándar para la mitigación de esta vulnerabilidad a nivel de arquitectura de software.

---

## 1. Requerimientos del Sistema

Para el despliegue y ejecución de este proyecto en un entorno local, es necesario contar con las siguientes herramientas de orquestación de contenedores:
* Docker Engine
* Docker Compose

## 2. Despliegue del Entorno

La arquitectura del proyecto se encuentra gestionada mediante contenedores para garantizar la reproducibilidad del entorno. 

Para iniciar los servicios, ejecute los siguientes comandos en la terminal, situándose en el directorio raíz del proyecto:

    docker compose up --build

Una vez que los servicios indiquen un estado de ejecución correcto, la interfaz de prueba estará disponible a través del navegador web en la dirección: http://localhost:3000

## 3. Arquitectura del Proyecto

El entorno se compone de un servidor Node.js y una base de datos relacional, organizados bajo la siguiente estructura:

    ├── docker-compose.yml       # Archivo de orquestación (Base de datos y Aplicación)
    ├── Dockerfile               # Instrucciones de construcción de la imagen Node.js
    ├── package.json             # Manifiesto de dependencias (Express, pg)
    ├── server.js                # Lógica del servidor backend (Punto de vulnerabilidad)
    ├── init.sql                 # Script de inicialización (DDL y DML de pruebas)
    └── public/                  # Directorio de recursos estáticos (Frontend)
        ├── index.html           
        ├── style.css            
        └── script.js            

## 4. Análisis de la Falla Arquitectónica

La vulnerabilidad explotable reside en el procesamiento de la autenticación dentro del archivo server.js. La consulta enviada al motor de base de datos PostgreSQL se construye mediante la concatenación directa de cadenas de texto de las variables de entrada:

    // Fragmento de la implementación vulnerable
    const queryText = `SELECT id, correo, rol FROM usuarios WHERE correo = '${correo}' AND password = '${password}';`;

Esta metodología transgrede el principio de separación entre sentencias de control (código SQL) y datos del usuario, permitiendo la alteración de la estructura lógica de la consulta mediante secuencias de escape.

## 5. Prueba de Concepto (Explotación)

Para demostrar el impacto de la vulnerabilidad, se procede a evadir el mecanismo de autenticación del usuario objetivo (emir@escom.com) sin poseer la credencial de acceso correspondiente.

### Procedimiento:
1. Acceder a la interfaz de autenticación en el puerto 3000.
2. En el campo destinado al **Correo Electrónico**, introducir la siguiente cadena de inyección:
   
       emir@escom.com' --
   
3. Omitir el llenado del campo de contraseña.
4. Enviar el formulario.

### Comportamiento del Motor SQL:
La inyección de los caracteres especiales modifica la consulta original enviada por el backend, resultando en la siguiente instrucción compilada por PostgreSQL:

    SELECT id, correo, rol FROM usuarios WHERE correo = 'emir@escom.com' --' AND password = '';

* El carácter de comilla simple (') finaliza prematuramente la cadena de texto esperada por el intérprete.
* La secuencia de doble guion (--) es interpretada como el inicio de un comentario SQL, lo cual instruye al motor a omitir la validación condicional de la contraseña (AND password = '').
* Consecuentemente, la base de datos retorna el registro asociado al correo electrónico y el sistema concede el acceso.

## 6. Mitigación y Buenas Prácticas

La prevención definitiva contra ataques de inyección SQL requiere la implementación de **Consultas Parametrizadas** (Prepared Statements). Este paradigma asegura que el motor de la base de datos precompile la estructura de la instrucción SQL, obligando a tratar cualquier entrada del usuario estrictamente como un dato de tipo escalar y no como código ejecutable.

**Implementación Segura Propuesta:**

    const queryText = 'SELECT id, correo, rol FROM usuarios WHERE correo = $1 AND password = $2';
    const values = [correo, password];

    // Ejecución segura mediante el driver pg
    const result = await pool.query(queryText, values);

Bajo este modelo arquitectónico, la base de datos interpretará la cadena maliciosa de forma literal, buscando un registro cuyo valor exacto sea "emir@escom.com' --", impidiendo así cualquier alteración en la lógica condicional del sistema.