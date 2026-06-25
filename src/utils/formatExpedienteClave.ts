export const formatExpedienteClave = (
  codigoOrganismo: string,
  tipo: string,
  numero: number,
  anno: number,
) => `${codigoOrganismo} ${tipo} ${numero}/${anno}`;
