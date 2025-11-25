from functools import wraps
from flask import session, abort, redirect, url_for, current_app, request
from ..models import Usuario
from .constants import STAFF_ROLES


def requires_roles(*roles, allow_bypass: bool = True):
    """Restringe acesso a cargos informados.
    Parametros:
      *roles: cargos permitidos.
      allow_bypass: se False, ignora AUTH_BYPASS e query ?bypass=1.
    """
    allowed = {r.strip().lower() for r in roles}

    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Bypass somente se habilitado e rota não crítica (ex: gerenciamento usuários sempre protegido)
            if allow_bypass and (current_app.config.get('AUTH_BYPASS') or request.args.get('bypass') == '1'):
                return f(*args, **kwargs)

            user_id = session.get('usuario_id')
            if not user_id:
                return redirect(url_for('main.index'))
            user = Usuario.query.get(user_id)
            cargo = (user.cargo or '').strip().lower() if user and user.cargo else ''
            if cargo not in allowed:
                abort(403)
            return f(*args, **kwargs)
        return wrapped
    return decorator

def is_staff(cargo: str) -> bool:
    """Retorna True se cargo pertence ao conjunto STAFF_ROLES."""
    return (cargo or '').strip().lower() in STAFF_ROLES
