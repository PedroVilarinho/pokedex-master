import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function DetailsScreen({ route }) {
  const { pokemon, favorites, toggleFavorite } = route.params;
  const [sound, setSound] = useState();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));

  const isFavorite = favorites.includes(pokemon.id);

  useEffect(() => {
    // Animações de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotação contínua da Pokébola
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playPokemonCry = async () => {
    try {
      const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: cryUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
    } catch (error) {
      console.log('Erro ao reproduzir som:', error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      fire: '#F08030', water: '#6890F0', grass: '#78C850',
      electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8',
      dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC',
      normal: '#A8A878', fighting: '#C03028', flying: '#A890F0',
      poison: '#A040A0', ground: '#E0C068', rock: '#B8A038',
      bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0',
    };
    return colors[type] || '#A8A878';
  };

  const mainType = pokemon.types[0].type.name;
  const backgroundColor = getTypeColor(mainType);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${backgroundColor}20` }]}>
      {/* Header com gradiente */}
      <Animated.View 
        style={[
          styles.header,
          { 
            backgroundColor: backgroundColor,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Pokébola decorativa */}
        <Animated.View 
          style={[
            styles.pokeballBg,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <Text style={styles.pokeballText}>⚪</Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.favoriteButtonLarge}
          onPress={() => toggleFavorite(pokemon.id)}
        >
          <Text style={styles.favoriteIconLarge}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soundButton}
          onPress={playPokemonCry}
        >
          <Text style={styles.soundIcon}>🔊</Text>
        </TouchableOpacity>

        <Image 
          source={{ 
            uri: pokemon.sprites.other['official-artwork'].front_default || 
                 pokemon.sprites.front_default 
          }}
          style={styles.image}
        />
        
        <View style={styles.headerInfo}>
          <Text style={styles.number}>#{pokemon.id.toString().padStart(3, '0')}</Text>
          <Text style={styles.name}>{pokemon.name}</Text>
          
          <View style={styles.typesContainer}>
            {pokemon.types.map(t => (
              <View 
                key={t.type.name} 
                style={[styles.typeBadge, { backgroundColor: getTypeColor(t.type.name) }]}
              >
                <Text style={styles.typeText}>{t.type.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Informações Básicas */}
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>📊 Informações Físicas</Text>
        <View style={styles.infoCards}>
          <View style={[styles.infoCard, { backgroundColor: `${backgroundColor}20` }]}>
            <Text style={styles.infoIcon}>📏</Text>
            <Text style={styles.infoLabel}>Altura</Text>
            <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: `${backgroundColor}20` }]}>
            <Text style={styles.infoIcon}>⚖️</Text>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
          </View>
        </View>
      </Animated.View>

      {/* Habilidades */}
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>✨ Habilidades</Text>
        <View style={styles.abilitiesContainer}>
          {pokemon.abilities.map((a, index) => (
            <View 
              key={a.ability.name}
              style={[
                styles.abilityCard,
                { 
                  backgroundColor: `${backgroundColor}15`,
                  borderLeftColor: backgroundColor,
                }
              ]}
            >
              <Text style={styles.abilityName}>
                {a.ability.name}
              </Text>
              {a.is_hidden && (
                <View style={styles.hiddenBadge}>
                  <Text style={styles.hiddenText}>Oculta</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Estatísticas */}
      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>💪 Estatísticas Base</Text>
        
        {/* Total Stats */}
        <View style={styles.totalStats}>
          <Text style={styles.totalStatsLabel}>Total</Text>
          <Text style={styles.totalStatsValue}>
            {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
          </Text>
        </View>

        {pokemon.stats.map(stat => {
          const percentage = (stat.base_stat / 255) * 100;
          const statColor = 
            stat.base_stat >= 130 ? '#4CAF50' :
            stat.base_stat >= 90 ? '#FFC107' :
            stat.base_stat >= 60 ? '#FF9800' : '#F44336';

          return (
            <View key={stat.stat.name} style={styles.statRow}>
              <Text style={styles.statName}>
                {stat.stat.name === 'hp' ? 'HP' :
                 stat.stat.name === 'attack' ? 'ATK' :
                 stat.stat.name === 'defense' ? 'DEF' :
                 stat.stat.name === 'special-attack' ? 'SP.ATK' :
                 stat.stat.name === 'special-defense' ? 'SP.DEF' :
                 stat.stat.name === 'speed' ? 'SPD' : stat.stat.name}
              </Text>
              <View style={styles.statBarContainer}>
                <Animated.View 
                  style={[
                    styles.statBar,
                    { 
                      width: `${percentage}%`,
                      backgroundColor: statColor,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.statValue, { color: statColor }]}>
                {stat.base_stat}
              </Text>
            </View>
          );
        })}
      </Animated.View>

      {/* Evoluções (placeholder) */}
      <Animated.View style={[styles.section, { opacity: fadeAnim, marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>🔄 Cadeia de Evolução</Text>
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Em breve...</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  pokeballBg: {
    position: 'absolute',
    top: -50,
    right: -50,
    opacity: 0.15,
  },
  pokeballText: {
    fontSize: 200,
  },
  favoriteButtonLarge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    padding: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  favoriteIconLarge: {
    fontSize: 28,
  },
  soundButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    padding: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  soundIcon: {
    fontSize: 24,
  },
  image: {
    width: 220,
    height: 220,
    marginTop: 20,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  number: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    marginBottom: 5,
  },
  name: {
    fontSize: 36,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: 'white',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  typeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  typeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoCards: {
    flexDirection: 'row',
    gap: 15,
  },
  infoCard: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  abilitiesContainer: {
    gap: 10,
  },
  abilityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  abilityName: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  hiddenBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hiddenText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 15,
  },
  totalStatsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  totalStatsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statName: {
    width: 80,
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  statBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 6,
  },
  statValue: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  comingSoon: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});