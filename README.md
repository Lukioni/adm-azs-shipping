# ADM AZS Shipping

Desenvolvido com **Spring Boot**, **PostgreSQL** e **React (Vite)**, tudo rodando via **Docker Compose**.

---

## Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)


## Como rodar o projeto

Clone este repositório e entre na pasta principal:

```bash
git clone https://github.com/lukioni/adm-azs-shipping.git
cd adm-azs-shipping

```
## Garantir construção do zero (sem cache e etc)
```bash
docker compose up --build --force-recreate --no-deps
```
OU
## Build Normal
```bash
docker compose up --build
```

## FRONTEND
http://localhost:5173

## BACKEND
http://localhost:8080/api/freights
