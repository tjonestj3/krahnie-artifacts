from PIL import Image, ImageDraw, ImageFont
import os, textwrap, math

OUT_DIR = '/home/tjonestj3/.hermes/hermes-agent/comic/xenos-html-bullying'
os.makedirs(OUT_DIR, exist_ok=True)
W,H = 1600,1200
img = Image.new('RGB',(W,H),(18,16,34))
d = ImageDraw.Draw(img)

# Fonts
def font(size, bold=False):
    paths = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p,size)
    return ImageFont.load_default()

F_TITLE=font(54,True); F_PANEL=font(34,True); F_TEXT=font(28,True); F_SMALL=font(23,False); F_CODE=font(25,True)

# palette
BG=(18,16,34); PANEL=(34,29,58); PANEL2=(25,31,55); LINE=(111,242,255); PINK=(255,75,178); YELLOW=(255,221,85); GREEN=(89,255,150); WHITE=(245,245,255); MUTED=(176,183,220); RED=(255,86,86); PURPLE=(132,92,255)

# pixel grid background
for x in range(0,W,40): d.line([(x,0),(x,H)], fill=(24,21,44), width=1)
for y in range(0,H,40): d.line([(0,y),(W,y)], fill=(24,21,44), width=1)
# title banner
d.rounded_rectangle([40,25,W-40,115], radius=18, fill=(12,12,25), outline=PINK, width=5)
d.text((70,40),'XENOS LEARNS HTML BY BULLYING HERMES IN DISCORD',font=F_TITLE,fill=YELLOW)
d.text((W-245,82),'KRAHNIE SKIN v1.0',font=F_SMALL,fill=GREEN)

panels = [(60,150,770,610),(830,150,1540,610),(60,660,770,1120),(830,660,1540,1120)]

def rect_shadow(box):
    x1,y1,x2,y2=box
    d.rounded_rectangle([x1+10,y1+10,x2+10,y2+10], radius=18, fill=(6,6,15))
    d.rounded_rectangle(box, radius=18, fill=PANEL, outline=LINE, width=5)

def bubble(box, text, tail=None, fill=(245,245,255), outline=(20,20,40), color=(20,20,40), size=27):
    x1,y1,x2,y2=box
    d.rounded_rectangle(box, radius=22, fill=fill, outline=outline, width=3)
    if tail:
        d.polygon(tail, fill=fill, outline=outline)
    f=font(size,True)
    max_chars=max(10,int((x2-x1)/15))
    lines=[]
    for para in text.split('\n'):
        lines += textwrap.wrap(para, width=max_chars) or ['']
    yy=y1+14
    for line in lines:
        d.text((x1+18,yy), line, font=f, fill=color)
        yy += size+7

def draw_xenos(cx,cy,scale=1.0, angry=False, laptop=False):
    # pixel-warrior hoodie avatar
    s=scale
    d.rectangle([cx-52*s,cy-25*s,cx+52*s,cy+85*s], fill=PURPLE, outline=WHITE, width=max(1,int(3*s)))
    d.rectangle([cx-42*s,cy-90*s,cx+42*s,cy-20*s], fill=(247,199,132), outline=WHITE, width=max(1,int(3*s)))
    d.rectangle([cx-50*s,cy-105*s,cx+50*s,cy-75*s], fill=(38,28,66))
    d.rectangle([cx-38*s,cy-82*s,cx-18*s,cy-62*s], fill=(10,10,20))
    d.rectangle([cx+18*s,cy-82*s,cx+38*s,cy-62*s], fill=(10,10,20))
    brow_y=cy-90*s if angry else cy-86*s
    d.line([cx-42*s,brow_y,cx-12*s,cy-78*s],fill=RED,width=max(2,int(5*s)))
    d.line([cx+12*s,cy-78*s,cx+42*s,brow_y],fill=RED,width=max(2,int(5*s)))
    d.rectangle([cx-22*s,cy-48*s,cx+22*s,cy-40*s], fill=(80,30,45))
    d.text((cx-54*s,cy+90*s),'XENOS',font=font(int(22*s),True),fill=YELLOW)
    if laptop:
        d.rectangle([cx-90*s,cy+40*s,cx+90*s,cy+110*s], fill=(12,14,30), outline=GREEN, width=3)
        d.text((cx-72*s,cy+55*s),'<html>',font=font(int(20*s),True),fill=GREEN)

def draw_hermes(cx,cy,scale=1.0, frazzled=False):
    s=scale
    d.rectangle([cx-75*s,cy-55*s,cx+75*s,cy+75*s], fill=(42,48,78), outline=LINE, width=max(1,int(4*s)))
    d.rectangle([cx-48*s,cy-20*s,cx-18*s,cy+10*s], fill=GREEN)
    d.rectangle([cx+18*s,cy-20*s,cx+48*s,cy+10*s], fill=GREEN)
    if frazzled:
        d.line([cx-34*s,cy+38*s,cx-6*s,cy+30*s,cx+22*s,cy+45*s,cx+48*s,cy+34*s], fill=YELLOW, width=max(1,int(4*s)))
        for a in range(8):
            ang=a*math.pi/4
            d.line([cx+math.cos(ang)*95*s,cy-20*s+math.sin(ang)*65*s,cx+math.cos(ang)*122*s,cy-20*s+math.sin(ang)*88*s], fill=PINK, width=3)
    else:
        d.arc([cx-35*s,cy+15*s,cx+35*s,cy+55*s],0,180,fill=YELLOW,width=max(1,int(4*s)))
    d.rectangle([cx-25*s,cy-90*s,cx+25*s,cy-55*s], fill=LINE)
    d.line([cx,cy-112*s,cx,cy-90*s], fill=LINE, width=max(1,int(4*s)))
    d.ellipse([cx-8*s,cy-125*s,cx+8*s,cy-109*s], fill=PINK)
    d.text((cx-58*s,cy+88*s),'HERMES',font=font(int(22*s),True),fill=LINE)

def draw_code_card(x,y,w,h,lines):
    d.rounded_rectangle([x,y,x+w,y+h], radius=14, fill=(10,12,28), outline=GREEN, width=3)
    yy=y+14
    for line,col in lines:
        d.text((x+16,yy),line,font=F_CODE,fill=col)
        yy+=34

# Panels
for i,p in enumerate(panels,1):
    rect_shadow(p)
    d.rectangle([p[0]+16,p[1]+16,p[0]+58,p[1]+58], fill=PINK)
    d.text((p[0]+27,p[1]+17),str(i),font=F_PANEL,fill=WHITE)

# 1
x1,y1,x2,y2=panels[0]
d.text((x1+75,y1+18),'The First Demand',font=F_PANEL,fill=YELLOW)
draw_xenos(x1+165,y1+330,1.15,angry=True)
draw_hermes(x1+550,y1+330,1.05)
bubble([x1+55,y1+90,x1+415,y1+195],'HERMES. MAKE ME A BUTTON. NOW.',tail=[(x1+150,y1+195),(x1+180,y1+245),(x1+230,y1+195)],fill=(255,245,170),outline=PINK,color=(25,20,45))
bubble([x1+330,y1+95,x1+690,y1+210],'Sure! HTML gives the page its structure.',tail=[(x1+555,y1+210),(x1+555,y1+250),(x1+600,y1+210)],fill=WHITE,outline=LINE,color=(20,25,45),size=25)
draw_code_card(x1+335,y1+245,330,125,[('<button>CLICK ME</button>',GREEN),('<!-- tiny internet brick -->',MUTED)])

#2
x1,y1,x2,y2=panels[1]
d.text((x1+75,y1+18),'Bullying Becomes Curriculum',font=F_PANEL,fill=YELLOW)
draw_xenos(x1+160,y1+340,1.08,angry=True)
draw_hermes(x1+560,y1+335,1.0,frazzled=True)
bubble([x1+50,y1+85,x1+460,y1+205],'BIGGER. SHINIER. KRAHNIE-CODED. WHY IS IT UGLY?',tail=[(x1+180,y1+205),(x1+205,y1+255),(x1+245,y1+205)],fill=(255,235,245),outline=PINK,color=(35,15,45),size=25)
bubble([x1+400,y1+80,x1+690,y1+185],'That part is CSS. HTML is the skeleton.',tail=[(x1+565,y1+185),(x1+555,y1+245),(x1+605,y1+185)],fill=WHITE,outline=LINE,color=(20,25,45),size=24)
draw_code_card(x1+330,y1+250,350,135,[('<button class="krahnie">',GREEN),('  PRESS START',YELLOW),('</button>',GREEN)])
# little CSS sparkles
d.text((x1+80,y1+500),'achievement unlocked: tags are not vibes',font=F_SMALL,fill=MUTED)

#3
x1,y1,x2,y2=panels[2]
d.text((x1+75,y1+18),'The Aha Moment',font=F_PANEL,fill=YELLOW)
draw_xenos(x1+160,y1+330,1.05,angry=False,laptop=True)
draw_hermes(x1+560,y1+335,1.0,frazzled=True)
bubble([x1+50,y1+90,x1+415,y1+190],'WAIT. So <h1> is a boss title, and <p> is dialogue?',tail=[(x1+175,y1+190),(x1+190,y1+245),(x1+235,y1+190)],fill=(235,255,240),outline=GREEN,color=(20,45,30),size=25)
bubble([x1+385,y1+90,x1+690,y1+210],'YES. Semantic HTML. You are becoming dangerous.',tail=[(x1+570,y1+210),(x1+560,y1+250),(x1+610,y1+210)],fill=WHITE,outline=LINE,color=(20,25,45),size=24)
draw_code_card(x1+325,y1+250,365,150,[('<main>',GREEN),('  <h1>Krahnie Quest</h1>',YELLOW),('  <p>Ship it.</p>',WHITE),('</main>',GREEN)])

#4
x1,y1,x2,y2=panels[3]
d.text((x1+75,y1+18),'Final Boss: Shipping It',font=F_PANEL,fill=YELLOW)
# arcade cabinet
d.rectangle([x1+70,y1+150,x1+360,y1+410], fill=(20,15,45), outline=PINK, width=5)
d.rectangle([x1+105,y1+185,x1+325,y1+315], fill=(5,10,20), outline=LINE, width=4)
d.text((x1+132,y1+202),'KRAHNIE',font=font(31,True),fill=YELLOW)
d.text((x1+120,y1+245),'<div>VICTORY</div>',font=font(20,True),fill=GREEN)
d.ellipse([x1+150,y1+345,x1+180,y1+375],fill=RED); d.ellipse([x1+200,y1+345,x1+230,y1+375],fill=YELLOW)
draw_xenos(x1+455,y1+345,1.0,angry=False,laptop=True)
draw_hermes(x1+620,y1+350,0.78,frazzled=False)
bubble([x1+390,y1+82,x1+690,y1+178],'I bullied the bot until I understood the DOM.',tail=[(x1+480,y1+178),(x1+500,y1+230),(x1+530,y1+178)],fill=(255,245,170),outline=PINK,color=(25,20,45),size=24)
bubble([x1+365,y1+450,x1+705,y1+535],'Hermes: “Training complete. Please stop yelling at the markup.”',fill=WHITE,outline=LINE,color=(20,25,45),size=23)
d.text((x1+82,y1+432),'MORAL: HTML is just polite boxes with names.',font=F_TEXT,fill=GREEN)

# footer
d.text((45,H-50),'A lovingly chaotic Krahnie comic • No agents were permanently bullied; one learned CSS anxiety.',font=F_SMALL,fill=MUTED)

# add scanlines
for y in range(0,H,4):
    d.line([(0,y),(W,y)], fill=(0,0,0), width=1)

png=os.path.join(OUT_DIR,'xenos-html-bullying-comic.png')
img.save(png)
print(png)
