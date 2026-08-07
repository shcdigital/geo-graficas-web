# Pendientes

## Seguridad

- [ ] **Rotar token de GitLab expuesto en remote de `geo-graficas-pay`**:
      el remote `origin` quedó con el token embebido en la URL
      (`https://pabloberthold:glpat-...@gitlab.com/...`). Pasos:
      1. Quitar el token del remote:
         `git remote set-url origin https://gitlab.com/pabloberthold/geo-graficas-pay.git`
      2. Rotar/revocar ese token en GitLab (Settings → Access Tokens).
      3. Si es el mismo token usado en otra parte (CI, wrangler), recrear las
         variables/secrets correspondientes.
