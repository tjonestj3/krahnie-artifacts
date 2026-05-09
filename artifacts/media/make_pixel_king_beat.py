import wave, math, random, struct, os
SR=44100
BPM=100
BEAT=60/BPM
BARS=24
DUR=BEAT*4*BARS
OUT='/home/tjonestj3/.hermes/hermes-agent/outputs/pixel-king-retro-beat.wav'
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# Helpers
def env(t, length, a=0.005, d=0.08):
    if t<0 or t>length: return 0.0
    if t<a: return t/a
    return max(0.0, math.exp(-(t-a)/d))

def sq(freq,t,duty=.5):
    return 1.0 if (t*freq)%1 < duty else -1.0

def tri(freq,t):
    x=(t*freq)%1
    return 4*abs(x-.5)-1

def noise(seed):
    random.seed(seed); return random.uniform(-1,1)

# Patterns
kick_steps={0,8,14}
snare_steps={4,12}
hat_steps=set(range(0,16,2))
# C minor-ish chiptune progression
bass_notes=[65.41,65.41,77.78,77.78,87.31,87.31,73.42,73.42] # C2, Eb2, F2, D2-ish
lead_scale=[261.63,311.13,349.23,392.00,466.16,523.25,622.25]

lyrics=[
    (0.5,"IN-SERT COIN"),(2.0,"PRESS START"),(3.0,"BIG DREAM HEART"),
    (5.0,"TWO D SPRITES"),(6.2,"ONE DEV SQUAD"),(7.4,"PIXEL BY PIXEL"),
    (9.0,"LAPTOP GLOW"),(10.2,"ARCADE SCREEN"),(11.4,"HALF MADE DREAM"),
    (13.0,"ONE BUILD MORE"),(14.2,"SYNTH LINE HITS"),(15.4,"BACK FLIP TRICKS"),
    (17.0,"NEXT GREAT INDIE DEV"),(19.0,"TWO D WORLD IN HIS HEAD"),
    (21.0,"RETRO BEATS"),(22.2,"C R T GLOW"),(23.4,"WATCH THAT GAME BLOW"),
    (25.2,"BOSS FIGHT HEART"),(26.4,"NO TRIPLE A FLEX"),(27.8,"HIGH SCORE FLOW"),
    (29.0,"BLIP BLIP BOOM BAP"),(30.2,"DON'T LOOK BACK"),(31.4,"RUN IT BACK"),
    (33.0,"PIXEL KING"),(34.2,"TOUCH DOWN"),(35.4,"OWN THIS TOWN"),
    (37.0,"HIDDEN GEM"),(38.2,"OF THE YEAR"),(39.4,"NO MAP NO FEAR"),
    (41.0,"ONE MORE BUG"),(42.2,"ONE MORE FIX"),(43.4,"ONE MORE TRICK"),
    (45.0,"LAUNCH BELL RINGS"),(46.2,"GIANT CROWD"),(47.4,"PIXEL CROWN"),
    (49.0,"NEXT GREAT INDIE DEV"),(51.0,"HIGH SCORE FLOW"),(53.0,"INSERT COIN"),(55.0,"DREAM LOADED")
]

def robot_phrase(t, start, text):
    # syllabic square-wave talkbox: not realistic speech, but chant-like and rhythmic
    local=t-start
    if local<0 or local>1.15: return 0
    chars=[c for c in text if c!=' ']
    if not chars: return 0
    idx=min(len(chars)-1, int(local/1.15*len(chars)))
    ch=chars[idx]
    base=220 + (ord(ch)%10)*22
    gate=1 if (local*12)%1 < .62 else 0
    form=0.55*sq(base,t,.42)+0.25*sq(base*1.5,t,.35)+0.15*tri(base*2,t)
    return gate*form*0.23

n=int(DUR*SR)
samples=[]
for i in range(n):
    t=i/SR
    beat=t/BEAT
    step=int((beat*4)%16) # 16ths in bar
    bar=int(beat//4)
    s=0.0
    # kick
    step_start=(int(beat*4))/(4/BEAT) if False else None
    for ks in kick_steps:
        pos=(bar*4 + ks/4)*BEAT
        lt=t-pos
        if 0<=lt<0.28:
            f=95*math.exp(-lt*12)+45
            s += math.sin(2*math.pi*f*t)*env(lt,.28,a=.003,d=.09)*0.95
    # snare noise + tone
    for ss in snare_steps:
        pos=(bar*4 + ss/4)*BEAT
        lt=t-pos
        if 0<=lt<0.22:
            s += noise(i)*env(lt,.22,a=.002,d=.055)*0.42
            s += math.sin(2*math.pi*180*t)*env(lt,.18,a=.002,d=.04)*0.18
    # hats
    for hs in hat_steps:
        pos=(bar*4 + hs/4)*BEAT
        lt=t-pos
        if 0<=lt<0.055:
            s += noise(i*3)*env(lt,.055,a=.001,d=.018)*0.22
    # bass eighth notes
    bnote=bass_notes[(bar//2)%len(bass_notes)]
    eighth=int((beat*2)%8)
    pos=(math.floor(beat*2)/2)*BEAT
    lt=t-pos
    if lt<0.22:
        s += sq(bnote,t,.48)*env(lt,.22,a=.005,d=.16)*0.28
        s += tri(bnote/2,t)*env(lt,.22,a=.005,d=.14)*0.14
    # arpeggio
    arp=[0,2,4,5,4,2,0,2]
    six=int((beat*4)%16)
    note=lead_scale[arp[six%len(arp)]]*(2 if bar%4>=2 else 1)
    pos=(math.floor(beat*4)/4)*BEAT
    lt=t-pos
    if lt<0.10 and bar>=2:
        s += sq(note,t,.25)*env(lt,.10,a=.002,d=.05)*0.18
    # hook lead every 4 bars
    if bar%8 in (4,5,6,7):
        mel=[523.25,466.16,392,466.16,523.25,622.25,523.25,392]
        pos=(math.floor(beat*2)/2)*BEAT
        lt=t-pos
        note=mel[int(beat*2)%len(mel)]
        if lt<0.20:
            s += tri(note,t)*env(lt,.20,a=.01,d=.12)*0.20
    # robot chant phrases
    for st,txt in lyrics:
        s += robot_phrase(t, st, txt)
    # simple limiter
    s=max(-0.98,min(0.98,s))
    samples.append(int(s*30000))

with wave.open(OUT,'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h',x) for x in samples))
print(OUT)
print(f'duration={DUR:.1f}s samples={n}')
