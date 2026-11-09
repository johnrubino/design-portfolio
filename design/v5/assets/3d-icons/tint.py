from PIL import Image, ImageOps
import sys
def hx(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def mix(a,b,t): return tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
def tint(src,col,out,size=None,lo=0.42,hi=0.78):
    im=Image.open(src).convert('RGBA')
    if size: im=im.resize((size,size),Image.LANCZOS)
    a=im.getchannel('A'); L=ImageOps.autocontrast(im.convert('L'),cutoff=1)
    c=hx(col); dark=mix(c,(20,20,19),lo); light=mix(c,(242,239,232),hi)
    lut=[mix(dark,light,i/255) for i in range(256)]
    rgb=Image.merge('RGB',[L.point([p[k] for p in lut]) for k in range(3)])
    rgb.putalpha(a); rgb.save(out)
if __name__=='__main__':
    tint(*sys.argv[1:4])
