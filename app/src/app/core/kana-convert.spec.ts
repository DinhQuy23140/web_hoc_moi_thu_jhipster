import { hiraganaToKatakana, kanaEquals, katakanaToHiragana, looksLikeRomaji, romajiToHiragana } from './kana-convert';

describe('kana-convert', () => {
  it('converts basic and compound romaji', () => {
    expect(romajiToHiragana('sensei')).toBe('せんせい');
    expect(romajiToHiragana('arigatou')).toBe('ありがとう');
    expect(romajiToHiragana('toukyou')).toBe('とうきょう');
    expect(romajiToHiragana('shashin')).toBe('しゃしん');
    expect(romajiToHiragana('tsukue')).toBe('つくえ');
  });

  it('handles small tsu, n and apostrophes', () => {
    expect(romajiToHiragana('kitte')).toBe('きって');
    expect(romajiToHiragana('gakkou')).toBe('がっこう');
    expect(romajiToHiragana('konnichiha')).toBe('こんにちは');
    expect(romajiToHiragana('sennen')).toBe('せんねん');
    expect(romajiToHiragana('hontou')).toBe('ほんとう');
    expect(romajiToHiragana('konnyaku')).toBe('こんにゃく');
    expect(romajiToHiragana('ponn')).toBe('ぽん');
    expect(romajiToHiragana('kan\'i')).toBe('かんい');
    expect(romajiToHiragana('hon')).toBe('ほん');
    expect(romajiToHiragana('hon', false)).toBe('ほn');
    expect(romajiToHiragana('ramen-')).toBe('らめんー');
  });

  it('switches between hiragana and katakana', () => {
    expect(hiraganaToKatakana('こーひー')).toBe('コーヒー');
    expect(katakanaToHiragana('テレビ')).toBe('てれび');
  });

  it('detects romaji input', () => {
    expect(looksLikeRomaji('sensei')).toBe(true);
    expect(looksLikeRomaji('せんせい')).toBe(false);
  });

  it('accepts romaji, hiragana or katakana for a kana target', () => {
    expect(kanaEquals('sensei', 'せんせい')).toBe(true);
    expect(kanaEquals('センセイ', 'せんせい')).toBe(true);
    expect(kanaEquals('terebi', 'テレビ')).toBe(true);
    expect(kanaEquals('sense', 'せんせい')).toBe(false);
  });
});
