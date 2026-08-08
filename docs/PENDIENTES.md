# Pendientes

## Seguridad

- [x] **Auth en `POST /email` del pay**: resuelto — `geo-graficas-admin` firma con
      `EMAIL_TOKEN` (secret compartido) y el pay lo valida en const-time
      (`src/index.ts`). Sin token → 401; token erróneo → 403.
- [ ] **Eliminar `/home/pablo/Escritorio/git.txt`** (tokens en texto plano):
      contiene tokens GitLab (algunos aún funcionales) y de OpenAI. Reemplazar
      por un gestor de secretos (pass, bitwarden, 1password CLI).
- [ ] **No guardar tokens en `opencode/memory.json`**: el memory global registró
      un token GitLab en claro. Revisar `/home/pablo/.config/opencode/memory.json`
      (el token GitHub de shcdigital aún está ahí; mover a un gestor).
