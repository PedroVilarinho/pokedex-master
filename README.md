# 📱 Pokédex Digital

Aplicativo mobile desenvolvido em React Native que funciona como uma Pokédex digital completa, consumindo dados da PokéAPI.

## 🎯 Funcionalidades Implementadas

### ✅ Obrigatórias

- **Listagem de Pokémons**: Lista rolável com scroll infinito, carregando 20 pokémons por vez
- **Busca**: Barra de busca para encontrar pokémons por nome ou número
- **Filtros**: Filtro por tipo (fogo, água, planta, elétrico, etc.)
- **Detalhes**: Tela completa com informações do pokémon (nome, número, imagem, tipos, altura, peso, habilidades e estatísticas)
- **Tratamento de Erros**: Mensagens amigáveis e botão para recarregar dados
- **Loading**: Indicadores visuais durante carregamento

## 🛠️ Tecnologias Utilizadas

- **React Native** com Expo
- **React Navigation** (Stack Navigator)
- **PokéAPI** (https://pokeapi.co/)
- **Hooks do React** (useState, useEffect)

## 📦 Instalação

### Pré-requisitos

- Node.js instalado
- npm ou yarn
- App Expo Go no celular (iOS/Android)

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/pokedex.git
cd pokedex-master
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npx expo start
```

4. Escaneie o QR Code com o app **Expo Go**

os prints do aplicativo funcionando estão na pasta prints

## 📂 Estrutura do Projeto

```
pokedex/
├── App.js                 # Configuração de navegação
├── screens/
│   ├── HomeScreen.js     # Tela principal com lista
│   └── DetailsScreen.js  # Tela de detalhes do pokémon
├── app.json
├── package.json
└── README.md
```

## 🎨 Screenshots

### Tela Principal
- Lista de pokémons em grade (2 colunas)
- Barra de busca no topo
- Filtros horizontais por tipo
- Scroll infinito com loading

### Tela de Detalhes
- Imagem oficial do pokémon
- Número e nome
- Tags de tipos com cores
- Informações (altura e peso)
- Lista de habilidades
- Estatísticas base com barras visuais

## 🚀 Como Usar

1. **Navegar**: Role a lista para ver mais pokémons (carrega automaticamente)
2. **Buscar**: Digite nome ou número na barra de busca
3. **Filtrar**: Toque em um tipo para filtrar (fire, water, etc.)
4. **Ver Detalhes**: Toque em qualquer pokémon da lista
5. **Voltar**: Use o botão "←" no topo ou o botão nativo do celular

## 🔧 Dependências

```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "react-native-screens": "^3.29.0",
  "react-native-safe-area-context": "^4.8.2"
}
```

## 💡 Destaques Técnicos

- **Componentização**: Código organizado em componentes reutilizáveis
- **Performance**: Paginação para não sobrecarregar a API
- **UX**: Feedback visual para loading, erros e busca vazia
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Cores Dinâmicas**: Tipos de pokémons com cores oficiais

## 📝 Melhorias Futuras

- [ ] Sistema de favoritos com AsyncStorage
- [ ] Modo offline
- [ ] Comparação entre pokémons
- [ ] Tema claro/escuro
- [ ] Animações de transição
- [ ] Sons dos pokémons

## 👨‍💻 Autor

**Seu Nome**
- Bacharelado em Ciência da Computação - UFU Campus Ituiutaba
- Disciplina: Programação Para Dispositivos Móveis (8º Período)
- Professor: André Luiz

## 📄 Licença

Este projeto é um trabalho acadêmico desenvolvido para fins educacionais.