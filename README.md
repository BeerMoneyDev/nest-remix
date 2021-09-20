<div align="center">
    <img alt="nestjs-package-starter" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h3>NestJS Package Starter</h3>
</div>

<p align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.15.4&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.10&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v8.0.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/>
    <img alt="GitHub Workflow Status" src="https://github.com/rudemex/nestjs-package-starter/actions/workflows/build.yml/badge.svg?branch=master">
    <!--<img alt="Codecov" src="https://img.shields.io/codecov/c/github/rudemex/nestjs-package-starter?logoColor=FFFFFF&logo=Codecov&labelColor=#F01F7A">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=rudemex_nestjs-package-starter&metric=alert_status" alt="sonarcloud">-->
    <br/> 
</p>

## Glosario

- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencias](#install-dependencies)
- [💻 Scripts](#scripts)
- [📤 Commits](#commits)
- [📜 License MIT](license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- Node.js v14.15.4 or higher ([Download](https://nodejs.org/es/download/))
- NPM v6.14.10 or higher
- NestJS v8 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencias

Cuando tenemos los requisitos básicos, clonamos el repositorio, vamos a la carpeta del proyecto e instalamos sus
dependencias.

```
 npm install
```

<a name="scripts"></a>

## 💻 Scripts

### Realiza el build del paquete

```
npm run build
```

Los builds se hacen con una herramienta llamada `@pika/pack` que por debajo usa `rollup`, una vez que el build se realizó, vas a poder acceder al contenido generado entrando a:

```bash
cd ./pkg
```

El folder `pkg` va a contener todo lo que necesitamos, desde los diferentes builds, hasta el `package.json` con las referencias a los módulos generados.

### Inicia los test con coverage

```
npm run test
```

### Eslintea el código

```
npm run lint
```

<a name="commits"></a>

## 📤 Commits

Para los mensajes de commits se toma como referencia [`conventional commits`](https://www.conventionalcommits.org/en/v1.0.0-beta.4/#summary).

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- **type:** chore, docs, feat, fix, refactor (más comunes)
- **scope:** indica la página, componente, funcionalidad
- **description:** comienza en minúsculas y no debe superar los 72 caracteres.

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="./.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
