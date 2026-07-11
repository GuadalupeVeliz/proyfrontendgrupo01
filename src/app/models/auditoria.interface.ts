export interface Auditoria {
    id: number;
    usuarioId: number | null;
    correoElectronico: string | null;
    rol: string | null;
    ultimoAcceso: string | null;
    accion: string;
    modelo: string;
    entidadId: number | null;
    metodo: string;
    ruta: string;
    ip: string;
    resultado: string;
    detalle: string | null;
    detalleError: string | null;
    createdAt: string
}

export interface FiltrosAuditoria {
    accion : [
        'Login',
        'Consultar',
        'Crear',
        'Modificar',
        'Eliminar',
        'Exportar',
        'Pagar',
        'Cancelar',
        'Confirmar',
        'SignUp',
        'Descargar'
    ],
    resultado : [
        'OK',
        'Error'
    ],
    modelo: [
        'Usuario',
        'Paquete Turistico',
        'Vacante',
        'Reserva',
        'Perfil de Usuario',
        'Empleado',
        'Cliente',
        'Dashboard',
        'Comprobante',
        'Pago'
    ]
}