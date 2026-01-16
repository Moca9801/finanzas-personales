export type TipoCuenta = 'debito' | 'credito' | 'efectivo' | 'ahorro' | 'inversion';

export interface Usuario {
    id: string;
    email: string;
    nombre_completo?: string;
    fecha_creacion?: string;
}

export interface Grupo {
    id: string;
    nombre_grupo: string;
    fecha_creacion?: string;
    lider_id: string;
    moneda_base: string;
}

export interface CuentaFondo {
    id?: string;
    grupo_id: string;
    nombre_cuenta: string;
    tipo_cuenta: TipoCuenta;
    institucion?: string;
    moneda: string;
    activa?: boolean;
    saldo_inicial: number;
    saldo_actual: number;

    // Specific fields for Credit/Savings
    limite_credito?: number;
    fecha_corte?: number;
    fecha_pago?: number;
    genera_rendimientos?: boolean;
    tasa_anual_porcentaje?: number;

    fecha_creacion?: string;
}

export type TipoTransaccion = 'ingreso' | 'egreso' | 'transferencia';
export type SubtipoTransaccion = 'ingreso_externo' | 'egreso_externo' | 'transferencia_interna' | 'rendimiento';

export interface Transaccion {
    id?: string;
    grupo_id: string;
    fecha_transaccion: string;
    hora_transaccion?: string;
    tipo_transaccion: TipoTransaccion;
    subtipo_transaccion: SubtipoTransaccion;
    monto: number;
    moneda: string;
    cuenta_origen_id?: string;
    cuenta_destino_id?: string;
    categoria_id?: string;
    concepto?: string;
    usuario_capturo_id: string;
    usuario_responsable_id: string;
    notas_adicionales?: string;
    fecha_creacion?: string;
}
