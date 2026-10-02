import { PhonemeSpec, TargetWord } from '../types/speech';

export const PHONEME_REGISTRY: Record<string, PhonemeSpec> = {
  'r': {
    symbol: '/r/',
    arpabet: 'R',
    name: 'R sound',
    category: 'liquid',
    articulatoryCue: 'Pull your tongue back slightly like a roaring tiger or racecar motor! Keep lips relaxed.',
    exampleWords: {
      initial: ['rabbit', 'rocket', 'rain', 'red', 'ring', 'robot'],
      medial: ['carrot', 'parrot', 'mirror', 'fairy', 'orange'],
      final: ['star', 'car', 'bear', 'door', 'tiger']
    }
  },
  's': {
    symbol: '/s/',
    arpabet: 'S',
    name: 'S sound',
    category: 'fricative',
    articulatoryCue: 'Close your teeth gently and blow a skinny hiss of cool air like a friendly snake!',
    exampleWords: {
      initial: ['sun', 'soap', 'sock', 'sea', 'seal', 'star'],
      medial: ['pencil', 'dinosaur', 'glasses', 'castle', 'basket'],
      final: ['bus', 'house', 'mouse', 'dress', 'grass']
    }
  },
  'l': {
    symbol: '/l/',
    arpabet: 'L',
    name: 'L sound',
    category: 'liquid',
    articulatoryCue: 'Tap the tip of your tongue behind your top front teeth and hum like a singing lullaby!',
    exampleWords: {
      initial: ['lion', 'lemon', 'leaf', 'ladder', 'lamp'],
      medial: ['balloon', 'yellow', 'pillow', 'apple', 'jelly'],
      final: ['ball', 'bell', 'pool', 'owl', 'snail']
    }
  },
  'k': {
    symbol: '/k/',
    arpabet: 'K',
    name: 'K sound',
    category: 'stop',
    articulatoryCue: 'Lift the back of your tongue to make a crisp coughing click in the back of your throat!',
    exampleWords: {
      initial: ['cat', 'kite', 'king', 'cup', 'key'],
      medial: ['monkey', 'cookie', 'jacket', 'chicken', 'baker'],
      final: ['duck', 'book', 'cake', 'snake', 'milk']
    }
  },
  'th': {
    symbol: '/θ/',
    arpabet: 'TH',
    name: 'TH sound (voiceless)',
    category: 'fricative',
    articulatoryCue: 'Peek the tip of your tongue between your teeth and blow a quiet feather breath!',
    exampleWords: {
      initial: ['thumb', 'think', 'three', 'thorn', 'thunder'],
      medial: ['birthday', 'toothbrush', 'bathtub', 'panther', 'python'],
      final: ['bath', 'math', 'tooth', 'earth', 'mouth']
    }
  },
  'ch': {
    symbol: '/tʃ/',
    arpabet: 'CH',
    name: 'CH sound',
    category: 'affricate',
    articulatoryCue: 'Stop the air with tongue up, then pop it out like a choo-choo train starting up!',
    exampleWords: {
      initial: ['chair', 'cheese', 'cherry', 'chicken', 'chimney'],
      medial: ['teacher', 'keychain', 'matches', 'watching', 'picture'],
      final: ['beach', 'watch', 'peach', 'witch', 'bench']
    }
  },
  'f': {
    symbol: '/f/',
    arpabet: 'F',
    name: 'F sound',
    category: 'fricative',
    articulatoryCue: 'Rest your top teeth gently on your bottom lip and blow a soft breeze like blowing out a candle!',
    exampleWords: {
      initial: ['fish', 'frog', 'fox', 'fork', 'fire'],
      medial: ['dolphin', 'muffin', 'waffle', 'coffee', 'elephant'],
      final: ['leaf', 'giraffe', 'chef', 'cliff', 'wolf']
    }
  }
};

export const TARGET_WORDS_CATALOG: TargetWord[] = [
  // /r/ targets
  {
    id: 'r_rabbit',
    word: 'rabbit',
    phoneticSpelling: '/ˈræb.ɪt/',
    targetPhoneme: 'r',
    targetPosition: 'initial',
    expectedPhonemes: ['r', 'æ', 'b', 'ɪ', 't'],
    syllables: ['rab', 'bit'],
    imageUrl: '/src/assets/images/target_rabbit_illustration_1790963820467.jpg',
    phrase: 'red rabbit',
    sentence: 'The fluffy rabbit hops in the green garden.',
    storyContext: 'A soft rabbit found a sweet red carrot near the river.'
  },
  {
    id: 'r_rocket',
    word: 'rocket',
    phoneticSpelling: '/ˈrɒk.ɪt/',
    targetPhoneme: 'r',
    targetPosition: 'initial',
    expectedPhonemes: ['r', 'ɒ', 'k', 'ɪ', 't'],
    syllables: ['rock', 'et'],
    imageUrl: '/src/assets/images/target_rocket_illustration_1790963834361.jpg',
    phrase: 'red rocket',
    sentence: 'The shiny rocket zooms into the starry sky.',
    storyContext: 'The fast rocket carried three friendly astronauts to Mars.'
  },
  {
    id: 'r_rain',
    word: 'rain',
    phoneticSpelling: '/reɪn/',
    targetPhoneme: 'r',
    targetPosition: 'initial',
    expectedPhonemes: ['r', 'eɪ', 'n'],
    syllables: ['rain'],
    phrase: 'cool rain',
    sentence: 'Gentle rain drops fall upon the flower petals.',
    storyContext: 'After the rain, a giant rainbow appeared above the roof.'
  },
  {
    id: 'r_red',
    word: 'red',
    phoneticSpelling: '/rɛd/',
    targetPhoneme: 'r',
    targetPosition: 'initial',
    expectedPhonemes: ['r', 'ɛ', 'd'],
    syllables: ['red'],
    phrase: 'bright red',
    sentence: 'The little red bird sang a sweet morning song.',
    storyContext: 'She wore a cozy red jacket on the windy road.'
  },
  {
    id: 'r_carrot',
    word: 'carrot',
    phoneticSpelling: '/ˈkær.ət/',
    targetPhoneme: 'r',
    targetPosition: 'medial',
    expectedPhonemes: ['k', 'æ', 'r', 'ə', 't'],
    syllables: ['car', 'rot'],
    phrase: 'crunchy carrot',
    sentence: 'The bunny munched a crunchy orange carrot.',
    storyContext: 'We picked a fresh carrot straight from grandma\'s farm.'
  },
  {
    id: 'r_star',
    word: 'star',
    phoneticSpelling: '/stɑːr/',
    targetPhoneme: 'r',
    targetPosition: 'final',
    expectedPhonemes: ['s', 't', 'ɑː', 'r'],
    syllables: ['star'],
    phrase: 'bright star',
    sentence: 'A tiny golden star twinkles high in the quiet night.',
    storyContext: 'Look up far away to find the brightest evening star.'
  },

  // /r/ Unseen Probe Words for Generalization
  {
    id: 'r_probe_robot',
    word: 'robot',
    phoneticSpelling: '/ˈroʊ.bɑːt/',
    targetPhoneme: 'r',
    targetPosition: 'initial',
    expectedPhonemes: ['r', 'oʊ', 'b', 'ɑː', 't'],
    syllables: ['ro', 'bot'],
    isUnseenProbe: true,
    phrase: 'rusty robot',
    sentence: 'The friendly robot waved its silver hand.',
    storyContext: 'The kind robot helped clean the room with a smile.'
  },
  {
    id: 'r_probe_river',
    word: 'river',
    phoneticSpelling: '/ˈrɪv.ər/',
    targetPhoneme: 'r',
    targetPosition: 'initial',
    expectedPhonemes: ['r', 'ɪ', 'v', 'ər'],
    syllables: ['riv', 'er'],
    isUnseenProbe: true,
    phrase: 'rushing river',
    sentence: 'The clear river flows over smooth round stones.',
    storyContext: 'Small yellow boats sailed happily down the winding river.'
  },
  {
    id: 'r_probe_mirror',
    word: 'mirror',
    phoneticSpelling: '/ˈmɪr.ər/',
    targetPhoneme: 'r',
    targetPosition: 'medial',
    expectedPhonemes: ['m', 'ɪ', 'r', 'ər'],
    syllables: ['mir', 'ror'],
    isUnseenProbe: true,
    phrase: 'silver mirror',
    sentence: 'She looked into the bright mirror and smiled.',
    storyContext: 'The clean mirror reflected the warm sunlight.'
  },

  // /s/ targets
  {
    id: 's_sun',
    word: 'sun',
    phoneticSpelling: '/sʌn/',
    targetPhoneme: 's',
    targetPosition: 'initial',
    expectedPhonemes: ['s', 'ʌ', 'n'],
    syllables: ['sun'],
    imageUrl: '/src/assets/images/target_sun_illustration_1790963845111.jpg',
    phrase: 'sunny sun',
    sentence: 'The warm sun shines brightly above the hilltop.',
    storyContext: 'When the golden sun comes up, the little birds start singing.'
  },
  {
    id: 's_soap',
    word: 'soap',
    phoneticSpelling: '/soʊp/',
    targetPhoneme: 's',
    targetPosition: 'initial',
    expectedPhonemes: ['s', 'oʊ', 'p'],
    syllables: ['soap'],
    phrase: 'sweet soap',
    sentence: 'Wash your hands with bubbly clean soap.',
    storyContext: 'Big foamy bubbles floated above the warm bath.'
  },
  {
    id: 's_pencil',
    word: 'pencil',
    phoneticSpelling: '/ˈpɛn.səl/',
    targetPhoneme: 's',
    targetPosition: 'medial',
    expectedPhonemes: ['p', 'ɛ', 'n', 's', 'əl'],
    syllables: ['pen', 'cil'],
    phrase: 'sharp pencil',
    sentence: 'He drew a smiling cat with his yellow pencil.',
    storyContext: 'The sharp pencil made neat curly letters on the page.'
  },
  {
    id: 's_bus',
    word: 'bus',
    phoneticSpelling: '/bʌs/',
    targetPhoneme: 's',
    targetPosition: 'final',
    expectedPhonemes: ['b', 'ʌ', 's'],
    syllables: ['bus'],
    phrase: 'yellow bus',
    sentence: 'The big yellow school bus stopped at the corner.',
    storyContext: 'All the smiling children waved from the windows of the bus.'
  },
  {
    id: 's_probe_seal',
    word: 'seal',
    phoneticSpelling: '/siːl/',
    targetPhoneme: 's',
    targetPosition: 'initial',
    expectedPhonemes: ['s', 'iː', 'l'],
    syllables: ['seal'],
    isUnseenProbe: true,
    phrase: 'silky seal',
    sentence: 'A sleek gray seal clapped its flippers in the water.',
    storyContext: 'The baby seal slid smoothly across the snowy ice.'
  },

  // /l/ targets
  {
    id: 'l_lion',
    word: 'lion',
    phoneticSpelling: '/ˈlaɪ.ən/',
    targetPhoneme: 'l',
    targetPosition: 'initial',
    expectedPhonemes: ['l', 'aɪ', 'ə', 'n'],
    syllables: ['li', 'on'],
    phrase: 'little lion',
    sentence: 'The proud golden lion rested in the warm shade.',
    storyContext: 'The playful lion cub loved running through tall grass.'
  },
  {
    id: 'l_ball',
    word: 'ball',
    phoneticSpelling: '/bɔːl/',
    targetPhoneme: 'l',
    targetPosition: 'final',
    expectedPhonemes: ['b', 'ɔː', 'l'],
    syllables: ['ball'],
    phrase: 'bouncing ball',
    sentence: 'The colorful rubber ball bounced high over the fence.',
    storyContext: 'We rolled the big blue ball across the playground.'
  },

  // /k/ targets
  {
    id: 'k_duck',
    word: 'duck',
    phoneticSpelling: '/dʌk/',
    targetPhoneme: 'k',
    targetPosition: 'final',
    expectedPhonemes: ['d', 'ʌ', 'k'],
    syllables: ['duck'],
    phrase: 'yellow duck',
    sentence: 'A cheerful duck quacked loudly by the pond.',
    storyContext: 'The mama duck swam in a line with her five little ducklings.'
  },
  {
    id: 'k_cup',
    word: 'cup',
    phoneticSpelling: '/kʌp/',
    targetPhoneme: 'k',
    targetPosition: 'initial',
    expectedPhonemes: ['k', 'ʌ', 'p'],
    syllables: ['cup'],
    phrase: 'clean cup',
    sentence: 'Pour some fresh milk into the blue cup.',
    storyContext: 'She held the cozy cup carefully with both hands.'
  },

  // /f/ targets
  {
    id: 'f_fish',
    word: 'fish',
    phoneticSpelling: '/fɪʃ/',
    targetPhoneme: 'f',
    targetPosition: 'initial',
    expectedPhonemes: ['f', 'ɪ', 'ʃ'],
    syllables: ['fish'],
    phrase: 'fast fish',
    sentence: 'A shiny silver fish swam quickly through the lake.',
    storyContext: 'Tiny bubbles tickled the little fish as it dashed under the lily pads.'
  }
];

export function getTargetsForPhoneme(phoneme: string): TargetWord[] {
  return TARGET_WORDS_CATALOG.filter(w => w.targetPhoneme === phoneme && !w.isUnseenProbe);
}

export function getUnseenProbesForPhoneme(phoneme: string): TargetWord[] {
  return TARGET_WORDS_CATALOG.filter(w => w.targetPhoneme === phoneme && w.isUnseenProbe);
}

export function getTargetById(id: string): TargetWord | undefined {
  return TARGET_WORDS_CATALOG.find(w => w.id === id);
}
