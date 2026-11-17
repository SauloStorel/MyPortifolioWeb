---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
description: "" # uma ou duas frases, de 120 a 160 caracteres: é o que aparece no Google
date: {{ .Date }}
draft: true # troque para false quando estiver pronto para publicar
translationKey: "{{ .File.ContentBaseName }}" # o mesmo nas duas versões (pt e en)
tags: [] # por exemplo: ["rails", "pagamentos"]
# resumo: pedir ao Claude depois que o texto estiver pronto (lista de frases, gerada por IA). Depois: node scripts/verificar-blog.mjs --atualizar-hashes
---

Uma ou duas linhas: que projeto é esse e para quem. Se ele tem página aqui no site, linke: [Nome do projeto](/projetos/slug/).

## A ideia

De onde veio e o que eu queria resolver.

## Os desafios

O que deu trabalho, o que não funcionou de primeira.

## Como eu fiz

O caminho: as decisões e o porquê delas.

## Tecnologias

O que usei e por que escolhi.
