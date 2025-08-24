// services/shareService.ts
// Serviço para montar a mensagem e compartilhar (nativo, WhatsApp) ou copiar.
// Inclui tratamento de erros e fallbacks.

import { APP_LINK, APP_NAME } from '@/constants/app';
import * as Clipboard from 'expo-clipboard';
import { Alert, Linking, Share } from 'react-native';

type BuildMsgParams = {
  title?: string;
  content?: string;
  includeLink?: boolean;
};

export function buildShareMessage({ title, content, includeLink = true }: BuildMsgParams): string {
  const titleLine = title ? `🙏 ${title}\n\n` : '🙏 Oração do dia\n\n';
  const body = (content ?? '').trim();
  const link = includeLink ? `\n\nBaixe o app ${APP_NAME}:\n${APP_LINK}` : '';
  return `${titleLine}${body}${link}`;
}

/** Compartilhamento nativo (abre o menu do sistema). */
export async function shareSystem(message: string): Promise<void> {
  if (!message?.trim()) throw new Error('Mensagem vazia.');
  try {
    await Share.share({ message }); // iOS/Android
  } catch (e: any) {
    throw new Error(e?.message ?? 'Falha ao abrir o compartilhamento.');
  }
}

/** Tentativa de abrir WhatsApp; se não tiver, usa web/fallback ou menu nativo. */
export async function shareWhatsApp(message: string): Promise<void> {
  if (!message?.trim()) throw new Error('Mensagem vazia.');
  const appUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
  const webUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return;
    }
    // Fallback web (abre no navegador)
    await Linking.openURL(webUrl);
  } catch {
    // Último fallback: menu nativo
    await shareSystem(message);
  }
}

/** Copia para a área de transferência. */
export async function copyToClipboard(message: string): Promise<void> {
  if (!message?.trim()) throw new Error('Mensagem vazia.');
  try {
    await Clipboard.setStringAsync(message);
  } catch {
    // Alguns ambientes podem falhar; informe o usuário para copiar manualmente
    Alert.alert('Ops', 'Não foi possível copiar automaticamente. Selecione e copie manualmente.');
  }
}
