# v4 transit-schematic map: octilinear routes, fixed-spacing bundles, rounded corners, capsule interchanges, route bullets.
import math
COL={"fowa":"#FF6B4A","fpl":"#E8A317","ppr":"#5B8CFF","labs":"#B57BFF","write":"#D4C09A"}
GREY="#5a5752"; INK="#161615"; WHITE="#f2efe8"
D="'Bricolage Grotesque',sans-serif"; F="'Public Sans',sans-serif"; M="'JetBrains Mono',monospace"
CODE={"fowa":"FoWA","fpl":"FPL","ppr":"PPR","labs":"Labs","write":"W"}

def norm(v): l=math.hypot(*v); return (v[0]/l,v[1]/l)
def offset(pts,d):
    """Offset an octilinear polyline by d (positive = right-hand side, i.e. below a rightward line) with miter joins."""
    out=[]
    for i,p in enumerate(pts):
        ns=[]
        if i>0: a=norm((p[0]-pts[i-1][0],p[1]-pts[i-1][1])); ns.append((-a[1],a[0]))
        if i<len(pts)-1: b=norm((pts[i+1][0]-p[0],pts[i+1][1]-p[1])); ns.append((-b[1],b[0]))
        if len(ns)==1: n=ns[0]; k=d
        else:
            m=norm((ns[0][0]+ns[1][0],ns[0][1]+ns[1][1])); k=d/(m[0]*ns[0][0]+m[1]*ns[0][1]); n=m
        out.append((round(p[0]+n[0]*k,2),round(p[1]+n[1]*k,2)))
    return out
def rpath(pts,r):
    """Polyline -> path with rounded corners (quadratic at each vertex, cut length r)."""
    s=f"M{pts[0][0]} {pts[0][1]}"
    for i in range(1,len(pts)-1):
        p0,p,p1=pts[i-1],pts[i],pts[i+1]
        a=norm((p[0]-p0[0],p[1]-p0[1])); b=norm((p1[0]-p[0],p1[1]-p[1]))
        la=math.hypot(p[0]-p0[0],p[1]-p0[1]); lb=math.hypot(p1[0]-p[0],p1[1]-p[1])
        c=min(r,la/2,lb/2)
        s+=f" L{p[0]-a[0]*c:.2f} {p[1]-a[1]*c:.2f} Q{p[0]} {p[1]} {p[0]+b[0]*c:.2f} {p[1]+b[1]*c:.2f}"
    s+=f" L{pts[-1][0]} {pts[-1][1]}"; return s
def T(x,y,s,fill,size,fam,w=400,anchor="start",ls=None,cls=None):
    a=f' text-anchor="{anchor}"' if anchor!="start" else ""; l=f' letter-spacing="{ls}"' if ls is not None else ""; c=f' class="{cls}"' if cls else ""
    return f'<text{c} x="{x}" y="{y}"{a}{l} fill="{fill}" font-family="{fam}" font-size="{size}" font-weight="{w}">{s}</text>'

def build(v="a"):
    thin = v=="b"
    S = 6 if thin else 9          # bundle spacing (centre to centre)
    LW = 2.5 if thin else 5       # line weight
    BW = 1.5 if thin else 3       # base (About–Timetable) line weight
    R  = 12 if thin else 16       # corner cut
    HUB=(150,390); ABOUT=(150,96); TT=(150,700); XT=596   # XT = terminus x (grid column for bullets/labels)
    LX = XT+16 if thin else XT+60                          # label column x
    # centrelines
    case_c=[HUB,(230,HUB[1]),(370,HUB[1]-140),(430,HUB[1]-140)]
    y0=HUB[1]-140
    routes={
     "fowa": offset(case_c[:-1]+[(452,y0),(540,y0-88),(XT,y0-88)], -2*S),
     "fpl":  offset(case_c[:-1]+[(XT,y0)], -S),
     "ppr":  offset(case_c[:-1]+[(430,y0),(520,y0+90),(XT,y0+90)], 0),
    }
    yl=HUB[1]+S; yw=HUB[1]+2*S
    routes["labs"]=[(HUB[0],yl),(240,yl),(360,yl+120),(440,yl+120),(520,yl+200),(XT,yl+200)]
    pp=routes["ppr"][-1]
    yb=pp[1]+S                                   # Labs branch runs parallel under PPR into the interchange
    lb_start=(400,yl+120); dy=lb_start[1]-yb
    routes["labsB"]=[(380,yl+120),lb_start,(lb_start[0]+dy,yb),(XT,yb)]
    routes["write"]=[(HUB[0],yw),(200,yw),(280,yw+80),(280,640),(340,700),(XT,700)]
    LINEKEY={"fowa":"fowa","fpl":"fpl","ppr":"ppr","labs":"labs","labsB":"labs","write":"write"}

    W,H=820,770
    s=f'<svg id="mapsvg" class="v4{v}" viewBox="-10 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg" style="--lw:{LW}px">'
    s+='<defs><filter id="blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"/></filter></defs>'
    term={"fowa":routes["fowa"][-1],"fpl":routes["fpl"][-1],"ppr":routes["ppr"][-1],"labs":routes["labs"][-1],"write":routes["write"][-1]}
    for k,(x,y) in term.items():
        s+=f'<circle class="ln ln-{k} field" cx="{x+20}" cy="{y}" r="26" fill="{COL[k]}" fill-opacity="0.12" filter="url(#blur)"/>'
    # base line (About – Home – Timetable)
    s+=f'<line class="base" x1="{ABOUT[0]}" y1="{ABOUT[1]}" x2="{TT[0]}" y2="{TT[1]}" stroke="{GREY}" stroke-width="{BW}" stroke-linecap="round"/>'
    # lines: dark casing first (separates bundled lines), then colour
    order=["write","labs","labsB","ppr","fpl","fowa"]
    if not thin:
        for r in order:
            s+=f'<path class="ln ln-{LINEKEY[r]} case" d="{rpath(routes[r],R)}" stroke="#1d1d1c" stroke-width="{LW+3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    for r in order:
        k=LINEKEY[r]
        s+=f'<path class="ln ln-{k} rt" id="p-{r}" style="--c:{COL[k]}" d="{rpath(routes[r],R)}" stroke="{COL[k]}" stroke-width="{LW}" fill="none" stroke-linecap="{"butt" if thin else "round"}" stroke-linejoin="round"/>'

    def capsule(x,y1,y2,cls="",w=None):
        w=w or (16 if not thin else 10); pad=w/2+ (1 if thin else 2)
        return f'<rect class="{cls}" x="{x-w/2}" y="{y1-pad}" width="{w}" height="{y2-y1+2*pad}" rx="{w/2}" fill="{WHITE}" stroke="{INK}" stroke-width="{2 if not thin else 1.5}"/>'
    def stop(x,y,k,horizontal=True):
        if thin:   # diagram tick on the label side (below for horizontal line)
            return f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+7}" stroke="{COL[k]}" stroke-width="{LW}"/>'
        return f'<circle cx="{x}" cy="{y}" r="5.5" fill="{WHITE}" stroke="{COL[k]}" stroke-width="3"/>'
    def bullet(x,y,k):
        c=CODE[k]
        if thin:  # outlined bullet beside the label
            w=10+7.2*len(c)
            return f'<rect x="{x}" y="{y-8}" width="{w:.1f}" height="16" rx="4" fill="none" stroke="{COL[k]}" stroke-width="1.25"/>'+T(round(x+w/2,1),y+4,c,COL[k],12,M,400,"middle")
        return f'<rect x="{x}" y="{y-9}" width="44" height="18" rx="9" fill="{COL[k]}"/>'+T(x+22,y+4,c,"#141413",12,M,400,"middle")
    def endcap(x,y,k):
        if thin: return f'<line x1="{x}" y1="{y-6}" x2="{x}" y2="{y+6}" stroke="{COL[k]}" stroke-width="{LW}"/>'
        return ""

    LBL="#c9c4bb"
    def labels(x,y,lines):
        lh=16; y0=y-(lh/2)*(len(lines)-1)+4
        return "".join(T(x,round(y0+i*lh),l,LBL,12,F,400,cls="lbl") for i,l in enumerate(lines))
    NAMES={"fowa":["Future of","Wealth Advisory"],"fpl":["Fully Paid","Lending"],"ppr":["Purple Panda","Rentals"],"labs":["Colllective Design"],"write":["Figma isn’t always","the starting line"]}
    # termini groups (hover targets)
    for k in ["fowa","fpl","ppr","labs","write"]:
        x,y=term[k]
        extra=" ln-labs" if k=="ppr" else ""
        g=f'<g class="ln ln-{k}{extra} stop" data-stop="{k}" data-x="{x}" data-y="{y}">'
        if k=="ppr":   # PPR × Labs interchange capsule spanning both lines
            yb2=routes["labsB"][-1][1]
            g+=capsule(x-26 if not thin else x-14,y,yb2)
            g+=endcap(x,(y+yb2)/2,k) if thin else ""
            ly=(y+yb2)/2
        else:
            g+=endcap(x,y,k); ly=y
        if thin:
            g+=bullet(XT+16,ly,k); lx=XT+16+10+7.2*len(CODE[k])+8
        else:
            g+=bullet(XT+8,ly,k); lx=LX
        if k=="write": g+=T(lx,round(ly-24),"LATEST ESSAY","#8f8b84",12,M,400,ls=0.6)
        g+=labels(lx,ly,NAMES[k])
        g+=f'<rect class="hit" x="{x-30}" y="{ly-24}" width="{810-x+30}" height="48" fill="transparent"/></g>'
        s+=g
    # Case studies interchange (spans the 3 case lines on the shared trunk)
    cx=400; ys=[routes[k][2][1] if False else None for k in ()]
    yt=y0-2*S; yb_=y0
    s+=f'<g class="ln ln-fowa ln-fpl ln-ppr">{capsule(cx,yt,yb_)}</g>'
    s+=T(cx,round(yt-(20 if not thin else 16)),"Case studies",WHITE,16,D,650,"middle",-0.3)
    # Labs station (regular stop on Labs line, branch point)
    lsx,lsy=lb_start
    s+=f'<g class="ln ln-labs">{stop(lsx,lsy,"labs")}</g>'
    s+=T(lsx,lsy+32,"Labs",WHITE,16,D,650,"middle",-0.3)
    # Design Thinker (regular stop on Writing line)
    s+=f'<g class="ln ln-write">{stop(420,700,"write")}</g>'
    s+=T(420,732,"Design Thinker",WHITE,16,D,650,"middle",-0.3)
    # About / Timetable termini of the base line
    for (x,y),l in ((ABOUT,"About"),(TT,"Timetable")):
        if thin: s+=f'<line x1="{x-6}" y1="{y}" x2="{x+6}" y2="{y}" stroke="#8a867f" stroke-width="2"/>'
        else: s+=f'<circle cx="{x}" cy="{y}" r="6" fill="{INK}" stroke="#8a867f" stroke-width="2.5"/>'
        s+=T(x-20,y+5,l,"#a8a39b",16,D,650,"end",-0.3)
    # Home hub: capsule spanning all five lines at the origin
    s+=f'<rect class="hub-ring" x="{HUB[0]-16}" y="{HUB[1]-2*S-16}" width="32" height="{4*S+32}" rx="16" fill="none" stroke="{WHITE}" stroke-width="1.35" opacity="0"/>'
    s+=capsule(HUB[0],HUB[1]-2*S,HUB[1]+2*S,w=(20 if not thin else 12))
    s+=T(HUB[0]-26,HUB[1]+5,"Home",WHITE,22,D,650,"end",-0.5)
    s+=T(HUB[0]-26,HUB[1]+24,"YOU ARE HERE","#8f8b84",12,M,400,"end",0.6).replace('<text','<text class="yah"')
    # train (moves along the active line on hover; JS-driven)
    s+=f'<circle id="train" r="{4 if not thin else 3}" fill="{WHITE}" stroke="{INK}" stroke-width="1.5" opacity="0"/>'
    return s+'</svg>'
if __name__=="__main__":
    open('/tmp/map4a.svg','w').write(build("a")); open('/tmp/map4b.svg','w').write(build("b")); print("ok")
