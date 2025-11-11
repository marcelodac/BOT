@echo off
title 🚀 6M13 - Cloner Eclipse Bot
color 0a

echo.
echo ============================================
echo          🚀 INICIANDO O BOT CLONER ECLIPSE
echo ============================================
echo.
echo 👾 Desenvolvido por 6M13 - Sistema Eclipse
echo 💾 Iniciando servidor Node.js...
echo.
timeout /t 2 >nul

:: Inicia o bot
node index.js

echo.
echo ============================================
echo 💀 O bot foi encerrado ou ocorreu um erro.
echo 🌀 Reiniciando em 5 segundos...
echo ============================================
timeout /t 5 >nul
cls
call start.bat
