// components/EnhancedPrayerCard.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { NexusColors, NexusSpacing, NexusTypography, createNexusTheme } from '../constants/NexusTheme';
import { useColorScheme } from '../hooks/useColorScheme';

// Pegar o tamanho da tela do celular (removido width não utilizado)
// const { width } = Dimensions.get('window');

// O que nosso card precisa para funcionar (como uma receita)
interface EnhancedPrayerCardProps {
  title?: string;           // Título da oração (opcional)
  content: string;          // Texto da oração (obrigatório)
  isCompleted?: boolean;    // Se já orou hoje
  onComplete?: () => void;  // O que fazer quando clicar "Orei"
  onShare?: () => void;     // O que fazer quando clicar "Compartilhar"
  variant?: 'default' | 'gradient' | 'daily';  // Tipo do card
  showActions?: boolean;    // Se mostra os botões
}

export const EnhancedPrayerCard: React.FC<EnhancedPrayerCardProps> = ({
  title,
  content,
  isCompleted = false,
  onComplete,
  onShare,
  variant = 'default',
  showActions = true,
}) => {
  // Descobrir se o celular está no modo escuro ou claro
  const colorScheme = useColorScheme();
  const theme = createNexusTheme(colorScheme === 'dark');
  
  // Fazer animação quando apertar o card (como apertar uma esponja)
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // Quando começar a apertar
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98, // Fica um pouquinho menor
      useNativeDriver: true,
    }).start();
  };
  
  // Quando parar de apertar
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Volta ao tamanho normal
      useNativeDriver: true,
    }).start();
  };

  // Conteúdo principal do card
  const cardContent = (
    <Animated.View 
      style={[
        styles.cardContainer,
        { 
          backgroundColor: theme.colors.card,
          transform: [{ scale: scaleAnim }], // Aplicar a animação
        }
      ]}
    >
      {/* Parte de cima com título (se tiver) */}
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          {/* Se já orou, mostrar uma medalha verde */}
          {isCompleted && (
            <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.completedText}>Concluída</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Texto da oração */}
      <View style={styles.contentContainer}>
        <Text style={[styles.prayerText, { color: theme.colors.text }]}>
          {content}
        </Text>
      </View>
      
      {/* Botões (se deve mostrar) */}
      {showActions && (
        <View style={styles.actionsContainer}>
          {/* Botão "Orei" - só aparece se ainda não orou */}
          {!isCompleted && onComplete && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onComplete}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Orei</Text>
            </TouchableOpacity>
          )}
          
          {/* Botão "Compartilhar" */}
          {onShare && (
            <TouchableOpacity
              style={[
                styles.secondaryButton, 
                { 
                  borderColor: theme.colors.primary,
                  backgroundColor: isCompleted ? theme.colors.primary : 'transparent'
                }
              ]}
              onPress={onShare}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="share-outline" 
                size={20} 
                color={isCompleted ? 'white' : theme.colors.primary}
                style={styles.buttonIcon} 
              />
              <Text 
                style={[
                  styles.secondaryButtonText, 
                  { 
                    color: isCompleted ? 'white' : theme.colors.primary 
                  }
                ]}
              >
                Compartilhar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );

  // Se for tipo gradiente, fazer com cores degradê
  if (variant === 'gradient') {
    return (
      <TouchableOpacity 
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[NexusColors.primary[500], NexusColors.primary[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.gradientOverlay}>
            {cardContent}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Card normal
  return (
    <TouchableOpacity 
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {cardContent}
    </TouchableOpacity>
  );
};

// Como cada parte deve parecer (como instruções de desenho)
const styles = StyleSheet.create({
  // Estilos para Views
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: NexusSpacing.lg,
    margin: NexusSpacing.md,
    shadowColor: NexusColors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NexusSpacing.lg,
  } as ViewStyle,
  
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: NexusSpacing.md,
  } as ViewStyle,
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: NexusSpacing.lg,
  } as ViewStyle,
  
  actionsContainer: {
    flexDirection: 'row',
    gap: NexusSpacing.md,
    marginTop: NexusSpacing.lg,
  } as ViewStyle,
  
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: NexusColors.primary[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  } as ViewStyle,
  
  buttonIcon: {
    marginRight: 8,
  } as TextStyle,
  
  gradientCard: {
    borderRadius: 16,
    padding: NexusSpacing.lg,
    margin: NexusSpacing.md,
    overflow: 'hidden',
  } as ViewStyle,
  
  gradientOverlay: {
    flex: 1,
    padding: NexusSpacing.lg,
  } as ViewStyle,
  
  // Estilos para Text
  title: {
    fontSize: NexusTypography.sizes.h2,
    fontWeight: '700' as const,
    flex: 1,
  } as TextStyle,
  
  completedText: {
    color: 'white',
    fontSize: NexusTypography.sizes.caption,
    fontWeight: '500' as const,
    marginLeft: 4,
  } as TextStyle,
  
  prayerText: {
    fontSize: NexusTypography.sizes.body,
    lineHeight: NexusTypography.sizes.body * NexusTypography.lineHeights.relaxed,
    fontWeight: '400' as const,
    textAlign: 'justify',
  } as TextStyle,
  
  primaryButtonText: {
    color: 'white',
    fontSize: NexusTypography.sizes.subtitle,
    fontWeight: '600' as const,
  } as TextStyle,
  
  secondaryButtonText: {
    fontSize: NexusTypography.sizes.subtitle,
    fontWeight: '600' as const,
  } as TextStyle,
});

export default EnhancedPrayerCard;