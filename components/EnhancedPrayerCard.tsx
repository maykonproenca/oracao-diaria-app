// components/EnhancedPrayerCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NexusColors, NexusTypography, NexusSpacing, createNexusTheme } from '../constants/NexusTheme';
import { useColorScheme } from '../hooks/useColorScheme';

// Pegar o tamanho da tela do celular
const { width } = Dimensions.get('window');

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
  cardContainer: {
    borderRadius: 20,           // Cantos arredondados
    padding: NexusSpacing.xl,   // Espaço interno grande
    marginVertical: NexusSpacing.lg,   // Espaço em cima e embaixo
    marginHorizontal: NexusSpacing.md, // Espaço nas laterais
    shadowColor: NexusColors.neutral[900], // Cor da sombra
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,         // Sombra clarinha
    shadowRadius: 16,           // Sombra espalhada
    elevation: 6,               // Sombra no Android
    minHeight: 200,             // Altura mínima
  },
  
  gradientCard: {
    borderRadius: 20,
    marginVertical: NexusSpacing.lg,
    marginHorizontal: NexusSpacing.md,
    shadowColor: NexusColors.primary[900],
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  
  gradientOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Clarinha por cima
    borderRadius: 20,
    padding: NexusSpacing.xl,
    minHeight: 200,
  },
  
  header: {
    flexDirection: 'row',        // Um do lado do outro
    justifyContent: 'space-between', // Separados
    alignItems: 'center',        // Alinhados no centro
    marginBottom: NexusSpacing.lg,
  },
  
  title: {
    fontSize: NexusTypography.sizes.h2,
    fontWeight: NexusTypography.weights.bold,
    flex: 1, // Ocupa o espaço disponível
  },
  
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: NexusSpacing.md,
  },
  
  completedText: {
    color: 'white',
    fontSize: NexusTypography.sizes.caption,
    fontWeight: NexusTypography.weights.medium,
    marginLeft: 4,
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: NexusSpacing.lg,
  },
  
  prayerText: {
    fontSize: NexusTypography.sizes.body,
    lineHeight: NexusTypography.sizes.body * NexusTypography.lineHeights.relaxed,
    fontWeight: NexusTypography.weights.regular,
    textAlign: 'justify', // Texto justificado
  },
  
  actionsContainer: {
    flexDirection: 'row',     // Botões um do lado do outro
    gap: NexusSpacing.md,     // Espaço entre os botões
    marginTop: NexusSpacing.lg,
  },
  
  primaryButton: {
    flex: 1,                  // Ocupa metade do espaço
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
  },
  
  primaryButtonText: {
    color: 'white',
    fontSize: NexusTypography.sizes.subtitle,
    fontWeight: NexusTypography.weights.semibold,
  },
  
  secondaryButton: {
    flex: 1,                  // Ocupa metade do espaço
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,           // Borda de 2 pixels
  },
  
  secondaryButtonText: {
    fontSize: NexusTypography.sizes.subtitle,
    fontWeight: NexusTypography.weights.semibold,
  },
  
  buttonIcon: {
    marginRight: 8,           // Espaço entre ícone e texto
  },
});

export default EnhancedPrayerCard;