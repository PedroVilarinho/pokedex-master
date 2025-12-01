import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGen, setSelectedGen] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 50; // Aumentado para carregar mais rápido
  const MAX_POKEMON = 898; // Total de pokémons até Gen 8
  
  const TYPES = ['all', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'normal'];
  
  const GENERATIONS = [
    { name: 'all', label: 'Todas', range: [1, 898] },
    { name: 'I', label: 'Gen I', range: [1, 151] },
    { name: 'II', label: 'Gen II', range: [152, 251] },
    { name: 'III', label: 'Gen III', range: [252, 386] },
    { name: 'IV', label: 'Gen IV', range: [387, 493] },
    { name: 'V', label: 'Gen V', range: [494, 649] },
    { name: 'VI', label: 'Gen VI', range: [650, 721] },
    { name: 'VII', label: 'Gen VII', range: [722, 809] },
    { name: 'VIII', label: 'Gen VIII', range: [810, 898] },
  ];

  // Carregar tema e favoritos
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      const savedFavorites = await AsyncStorage.getItem('favorites');
      
      if (savedTheme !== null) setDarkMode(JSON.parse(savedTheme));
      if (savedFavorites !== null) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      console.log('Erro ao carregar configurações:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newTheme));
  };

  const toggleFavorite = async (pokemonId) => {
    let newFavorites;
    if (favorites.includes(pokemonId)) {
      newFavorites = favorites.filter(id => id !== pokemonId);
    } else {
      newFavorites = [...favorites, pokemonId];
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Carregar Pokémons por Geração (SEM CACHE - evita disco cheio)
  const loadPokemonsByGeneration = async (gen) => {
    setLoading(true);
    setError(null);

    try {
      const generation = GENERATIONS.find(g => g.name === gen);
      if (!generation || gen === 'all') {
        loadPokemons(true);
        return;
      }

      const [start, end] = generation.range;

      const pokemonIds = [];
      for (let i = start; i <= end; i++) {
        pokemonIds.push(i);
      }

      const detailedPokemons = await Promise.all(
        pokemonIds.map(async (id) => {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          return await res.json();
        })
      );
      
      setPokemons(detailedPokemons);
      setFilteredPokemons(detailedPokemons);
      setHasMore(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar Pokémons - SEM CACHE (evita disco cheio)
  const loadPokemons = async (isInitial = false) => {
    if (loading || (!hasMore && !isInitial)) return;
    
    setLoading(true);
    setError(null);

    try {
      const currentOffset = isInitial ? 0 : offset;
      
      if (currentOffset >= MAX_POKEMON) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${currentOffset}`
      );
      
      if (!response.ok) throw new Error('Falha ao carregar pokémons');
      
      const data = await response.json();
      
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(pokemon.url);
          return await res.json();
        })
      );

      if (isInitial) {
        setPokemons(detailedPokemons);
        setFilteredPokemons(detailedPokemons);
        setOffset(LIMIT);
        setHasMore(true);
      } else {
        setPokemons(prev => [...prev, ...detailedPokemons]);
        setFilteredPokemons(prev => [...prev, ...detailedPokemons]);
        setOffset(prev => prev + LIMIT);
      }

      if (currentOffset + LIMIT >= MAX_POKEMON) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokemons(true);
  }, []);

  useEffect(() => {
    let filtered = pokemons;

    if (showFavoritesOnly) {
      filtered = filtered.filter(p => favorites.includes(p.id));
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(p =>
        p.types.some(t => t.type.name === selectedType)
      );
    }

    // Filtro de geração removido daqui - agora carrega direto por geração

    setFilteredPokemons(filtered);
  }, [searchQuery, selectedType, pokemons, favorites, showFavoritesOnly]);

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

  const PokemonCard = ({ item, index }) => {
    const [scaleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 30,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={[
            styles.pokemonCard,
            darkMode && styles.pokemonCardDark,
          ]}
          onPress={() => navigation.navigate('Details', { pokemon: item, favorites, toggleFavorite })}
          activeOpacity={0.8}
        >
          <View style={[styles.cardInner, { borderColor: getTypeColor(item.types[0].type.name) }]}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Text style={styles.favoriteIcon}>
                {favorites.includes(item.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.imageContainer, { backgroundColor: `${getTypeColor(item.types[0].type.name)}20` }]}>
              <Image 
                source={{ uri: item.sprites.front_default }}
                style={styles.pokemonImage}
              />
            </View>
            
            <View style={styles.cardInfo}>
              <Text style={[styles.pokemonNumber, darkMode && styles.textDark]}>
                #{item.id.toString().padStart(3, '0')}
              </Text>
              <Text style={[styles.pokemonName, darkMode && styles.textDark]}>
                {item.name}
              </Text>
              <View style={styles.typesContainer}>
                {item.types.map(t => (
                  <View 
                    key={t.type.name} 
                    style={[
                      styles.typeBadge, 
                      { backgroundColor: getTypeColor(t.type.name) }
                    ]}
                  >
                    <Text style={styles.typeText}>{t.type.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const themes = {
    light: {
      background: '#DC0A2D',
      frame: '#ffffff',
      screen: '#98CB98',
      card: '#ffffff',
      text: '#333333',
      border: '#2C2C2C',
    },
    dark: {
      background: '#8B0000',
      frame: '#2d2d2d',
      screen: '#1a4d1a',
      card: '#3d3d3d',
      text: '#ffffff',
      border: '#555555',
    }
  };

  const currentTheme = darkMode ? themes.dark : themes.light;

  if (error && pokemons.length === 0) {
    return (
      <View style={[styles.pokedexFrame, { backgroundColor: currentTheme.background }]}>
        <View style={[styles.screenContainer, { backgroundColor: currentTheme.screen }]}>
          <Text style={[styles.errorText, { color: currentTheme.text }]}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPokemons(true)}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.pokedexFrame, { backgroundColor: currentTheme.background }]}>
      {/* Decoração superior da Pokédex */}
      <View style={styles.pokedexTop}>
        <View style={styles.bigLight} />
        <View style={styles.smallLights}>
          <View style={[styles.smallLight, { backgroundColor: '#FF0000' }]} />
          <View style={[styles.smallLight, { backgroundColor: '#FFFF00' }]} />
          <View style={[styles.smallLight, { backgroundColor: '#00FF00' }]} />
        </View>
        <View style={styles.themeToggleContainer}>
          <Text style={styles.themeText}>{darkMode ? '🌙' : '☀️'}</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Tela principal da Pokédex */}
      <Animated.View style={[styles.screenContainer, { backgroundColor: currentTheme.screen, opacity: fadeAnim }]}>
        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.favoritesToggle,
              showFavoritesOnly && styles.favoritesToggleActive
            ]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Text style={styles.favoritesToggleText}>
              ❤️ {showFavoritesOnly ? `Favoritos (${favorites.length})` : 'Ver Favoritos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Busca */}
        <TextInput
          style={[styles.searchInput, { color: currentTheme.text }]}
          placeholder="Buscar Pokémon..."
          placeholderTextColor={darkMode ? '#90EE90' : '#2d5016'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filtros de Geração */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {GENERATIONS.map(gen => (
            <TouchableOpacity
              key={gen.name}
              style={[
                styles.filterButton,
                selectedGen === gen.name && styles.filterButtonActive
              ]}
              onPress={() => {
                setSelectedGen(gen.name);
                setSearchQuery('');
                setSelectedType('all');
                setShowFavoritesOnly(false);
                loadPokemonsByGeneration(gen.name);
              }}
            >
              <Text style={[
                styles.filterText,
                selectedGen === gen.name && styles.filterTextActive
              ]}>
                {gen.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filtros de Tipo */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && { backgroundColor: getTypeColor(type) }
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[
                styles.filterText,
                selectedType === type && { color: 'white', fontWeight: 'bold' }
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de Pokémons */}
        {filteredPokemons.length === 0 && !loading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: darkMode ? '#90EE90' : '#2d5016' }]}>
              {showFavoritesOnly 
                ? '😢 Nenhum favorito ainda!\n\nToque no ❤️ para adicionar' 
                : '😢 Nenhum Pokémon encontrado'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPokemons}
            renderItem={({ item, index }) => <PokemonCard item={item} index={index} />}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            onEndReached={() => selectedGen === 'all' && !searchQuery && selectedType === 'all' && !showFavoritesOnly && hasMore && loadPokemons()}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={
              loading ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="large" color={darkMode ? '#90EE90' : '#2d5016'} />
                  <Text style={[styles.loadingText, { color: darkMode ? '#90EE90' : '#2d5016' }]}>
                    Carregando mais Pokémons...
                  </Text>
                </View>
              ) : !hasMore && pokemons.length > 0 ? (
                <Text style={[styles.endText, { color: darkMode ? '#90EE90' : '#2d5016' }]}>
                  🎉 Todos os {pokemons.length} Pokémons carregados!
                </Text>
              ) : null
            }
          />
        )}
      </Animated.View>

      {/* Decoração inferior da Pokédex */}
      <View style={styles.pokedexBottom}>
        <View style={styles.hinge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pokedexFrame: {
    flex: 1,
    paddingTop: 10,
  },
  pokedexTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  bigLight: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4FC3F7',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  smallLights: {
    flexDirection: 'row',
    gap: 8,
  },
  smallLight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  themeText: {
    fontSize: 20,
  },
  screenContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 15,
    borderWidth: 8,
    borderColor: '#2C2C2C',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  controls: {
    marginBottom: 10,
  },
  favoritesToggle: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-start',
  },
  favoritesToggleActive: {
    backgroundColor: '#FFD700',
  },
  favoritesToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#2C2C2C',
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 8,
    maxHeight: 45,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 15,
    marginRight: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 2,
    borderColor: '#2C2C2C',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  filterText: {
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
    color: '#2C2C2C',
  },
  filterTextActive: {
    color: '#2C2C2C',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  pokemonCard: {
    flex: 1,
    margin: 4,
  },
  cardInner: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pokemonCardDark: {
    backgroundColor: '#3d3d3d',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  imageContainer: {
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
  },
  pokemonImage: {
    width: 90,
    height: 90,
  },
  cardInfo: {
    alignItems: 'center',
    marginTop: 5,
  },
  pokemonNumber: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
  },
  pokemonName: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginVertical: 3,
    color: '#2C2C2C',
  },
  textDark: {
    color: '#ffffff',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  endText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#2C2C2C',
  },
  retryText: {
    color: '#2C2C2C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  pokedexBottom: {
    padding: 10,
    alignItems: 'center',
  },
  hinge: {
    width: 60,
    height: 6,
    backgroundColor: '#2C2C2C',
    borderRadius: 3,
  },
});