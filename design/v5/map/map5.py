# v5 vertical side-rail transit map (220px). Lanes peel off east-most first, so lines never cross.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from map4 import offset, rpath, T, COL, CODE, GREY, INK, WHITE, D, F, M
LBL="#c9c4bb"
ESSAY_URL="https://johnrubino.substack.com/p/figma-isnt-always-the-starting-line"
DEST={"fowa":"#stop-fowa","fpl":"#stop-fpl","ppr":"#stop-ppr","labs":"#stop-labs","write":ESSAY_URL}
def build5(W=220,H=800):
    S=9; LW=5; R=14; BX=28; HY=104; TX=72; XT=150        # base x, home y, trunk centre x, terminus x
    ABOUT=(BX,36); TT=(BX,H-36)
    centre=[(BX,HY),(TX,HY)]
    def lane(d,yturn):   # down the trunk in its lane, then east to the terminus
        pts=offset(centre+[(TX,yturn),(XT,yturn)],d)
        pts[-1]=(XT,pts[-1][1]); return pts
    rows={"fowa":226,"fpl":306,"ppr":386,"labs":520,"write":650}
    off={"fowa":-2*S,"fpl":-S,"ppr":0,"labs":S,"write":2*S}
    routes={k:lane(off[k],rows[k]-off[k]) for k in rows}   # final horizontal lands exactly on rows[k]
    lanex={k:TX-off[k] for k in rows}                      # vertical lane x for each line
    s=f'<svg id="mapsvg" class="v5" viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" style="--lw:{LW}px">'
    s+='<defs><filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12"/></filter></defs>'
    term={k:routes[k][-1] for k in rows}
    for k,(x,y) in term.items():
        s+=f'<circle class="ln ln-{k} field" cx="{x+22}" cy="{y}" r="22" fill="{COL[k]}" fill-opacity="0.12" filter="url(#blur)"/>'
    s+=f'<line class="base" x1="{BX}" y1="{ABOUT[1]}" x2="{BX}" y2="{TT[1]}" stroke="{GREY}" stroke-width="3" stroke-linecap="round"/>'
    order=["write","labs","ppr","fpl","fowa"]
    for k in order: s+=f'<path class="ln ln-{k} case" d="{rpath(routes[k],R)}" stroke="#1d1d1c" stroke-width="{LW+3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    for k in order: s+=f'<path class="ln ln-{k} rt" id="p-{k}" style="--c:{COL[k]}" d="{rpath(routes[k],R)}" stroke="{COL[k]}" stroke-width="{LW}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    def hcap(y,x1,x2,cls):   # horizontal capsule spanning vertical lanes x1..x2
        return f'<g class="{cls}"><rect x="{x1-10}" y="{y-8}" width="{x2-x1+20}" height="16" rx="8" fill="{WHITE}" stroke="{INK}" stroke-width="2"/></g>'
    def bullet(x,y,k): return f'<rect x="{x}" y="{y-9}" width="44" height="18" rx="9" fill="{COL[k]}"/>'+T(x+22,y+4,CODE[k],"#141413",12,M,400,"middle")
    def labels(x,y,lines,first=0): return "".join(T(x,y+i*16,l,LBL,12,F,400,cls="lbl") for i,l in enumerate(lines))
    NAMES={"fowa":["Future of","Wealth Advisory"],"fpl":["Fully Paid","Lending"],"ppr":["Purple Panda","Rentals"],"labs":["Colllective","Design"],"write":["Figma isn’t always","the starting line"]}
    LX=96
    for k in rows:
        x,y=term[k]; extra=" ln-labs" if k=="ppr" else ""
        g=f'<a href="{DEST[k]}"'+(' target="_blank" rel="noopener"' if k=="write" else '')+f' aria-label="{" ".join(NAMES[k])}"><g class="ln ln-{k}{extra} stop" data-stop="{k}" data-x="{x}" data-y="{y}">'
        g+=bullet(XT+4,y,k)
        ly=y+22
        if k=="write": g+=T(LX,ly,"LATEST ESSAY","#8f8b84",12,M,400,ls=0.6); ly+=16
        g+=labels(LX,ly,NAMES[k])
        g+=f'<rect class="hit" x="{LX-8}" y="{y-16}" width="{W-LX+8}" height="{ly-y+16+20+(16 if len(NAMES[k])>1 else 0)}" fill="transparent"/></g></a>'
        s+=g
    # Case studies interchange across the three case lanes, label to the right
    xs=sorted([lanex["fowa"],lanex["fpl"],lanex["ppr"]])
    s+=hcap(166,xs[0],xs[-1],"ln ln-fowa ln-fpl ln-ppr")
    s+=T(LX+6,171,"Case studies",WHITE,16,D,650,ls=-0.3)
    # PPR × Labs interchange on the trunk, just above PPR's turn
    s+=hcap(352,lanex["labs"],lanex["ppr"],"ln ln-ppr ln-labs")
    # Labs station (regular stop) and Design Thinker station
    for k,y,name in (("labs",462,"Labs"),("write",592,"Design Thinker")):
        x=lanex[k]
        s+=f'<g class="ln ln-{k}"><circle cx="{x}" cy="{y}" r="5.5" fill="{WHITE}" stroke="{COL[k]}" stroke-width="3"/></g>'
        s+=T(x+16,y+5,name,WHITE,16,D,650,ls=-0.3)
    # About / Timetable on the grey base line (links)
    for (x,y),l,href in ((ABOUT,"About","https://johnrubino.design/about"),(TT,"Timetable","#stop-timetable")):
        tgt=' target="_blank" rel="noopener"' if href.startswith("http") else ""
        s+=f'<a href="{href}"{tgt}><circle cx="{x}" cy="{y}" r="6" fill="{INK}" stroke="#8a867f" stroke-width="2.5"/>'+T(x+16,y+5,l,"#a8a39b",16,D,650,ls=-0.3)+'</a>'
    # Home hub: vertical capsule on the base line spanning the 5 departing lines
    s+=f'<rect class="hub-ring" x="{BX-14}" y="{HY-2*S-14}" width="28" height="{4*S+28}" rx="14" fill="none" stroke="{WHITE}" stroke-width="1.35" opacity="0"/>'
    s+=f'<a href="#home"><rect x="{BX-10}" y="{HY-2*S-10}" width="20" height="{4*S+20}" rx="10" fill="{WHITE}" stroke="{INK}" stroke-width="2"/></a>'
    s+=T(LX+6,HY+2,"Home",WHITE,22,D,650,ls=-0.5)
    s+=T(LX+6,HY+20,"YOU ARE HERE","#8f8b84",12,M,400,ls=0.6).replace('<text','<text class="yah"')
    s+=f'<circle id="train" r="4" fill="{WHITE}" stroke="{INK}" stroke-width="1.5" opacity="0"/>'
    return s+'</svg>'
STRIP_ITEMS=[("home","Home","#home",None),("fowa","FoWA","#stop-fowa",COL["fowa"]),("fpl","FPL","#stop-fpl",COL["fpl"]),("ppr","PPR","#stop-ppr",COL["ppr"]),("labs","Labs","#stop-labs",COL["labs"]),("write","W",ESSAY_URL,COL["write"])]
def strip():
    return '<nav class="strip" aria-label="System map">'+"".join(f'<a href="{h}" class="st{" st-home" if not c else ""}"'+(f' style="--c:{c}"' if c else '')+('' if not h.startswith('http') else ' target="_blank" rel="noopener"')+f'>{t}</a>' for k,t,h,c in STRIP_ITEMS)+'</nav>'
if __name__=="__main__": open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'rail-map.svg'),'w').write(build5()); print('ok')
