# Pendientes

## Seguridad

- [ ] **Rotar token de GitLab revocado del remote de `geo-graficas-pay`**:
      el remote quedó sin token (fix aplicado), pero el token `glpat-q1Ge...` ya
      estaba **revocado** (401). Si algún día se necesita acceder al pay por API,
      crear un token nuevo para ese repo (es privado) y guardarlo en un gestor.
- [ ] **Eliminar `/home/pablo/Escritorio/git.txt`** (tokens en texto plano):
      contiene tokens GitLab (algunos aún funcionales) y de OpenAI. Reemplazar
      por un gestor de secretos (pass, bitwarden, 1password CLI).
- [ ] **No guardar tokens en `opencode/memory.json`**: el memory global registró
      un token GitLab en claro. Revisar `/home/pablo/.config/opencode/memory.json`.

## Técnica (bajo impacto, follow-up)

- [ ] **Seguridad headers en el admin Worker** (CSP, X-Frame-Options, HSTS) —
      revisión integral detectó que faltan; no bloqueante.
- [ ] **Auth en `POST /email` del pay**: el endpoint restringe destinatario a
      `ADMIN_EMAIL` pero no valida un token/secret de origen; posible abuso de
      cuota de Resend desde el panel. Evaluar secreto compartido con el admin.
