import { useState, useMemo, useEffect } from "react";

// TER Category A — PMK 168/2023 Lampiran (PTKP: TK/0, TK/1, K/0), per 1 Jan 2024
const TER_A=[[5400000,0],[5650000,.0025],[5950000,.005],[6300000,.0075],[6750000,.01],[7500000,.0125],[8550000,.015],[9650000,.0175],[10050000,.02],[10350000,.0225],[10700000,.025],[11050000,.03],[11600000,.035],[12500000,.04],[13750000,.05],[15100000,.06],[16950000,.07],[19750000,.08],[24150000,.09],[26450000,.10],[28000000,.11],[30050000,.12],[32400000,.13],[35400000,.14],[39100000,.15],[43850000,.16],[47800000,.17],[51400000,.18],[56300000,.19],[62200000,.20],[68600000,.21],[77500000,.22],[89000000,.23],[103000000,.24],[125000000,.25],[157000000,.26],[206000000,.27],[337000000,.28],[454000000,.29],[550000000,.30],[695000000,.31],[910000000,.32],[1400000000,.33],[Infinity,.34]];
// TER Category B — PMK 168/2023 Lampiran (PTKP: TK/2, K/1, TK/3, K/2), per 1 Jan 2024
const TER_B=[[6200000,0],[6500000,.0025],[6850000,.005],[7300000,.0075],[9200000,.01],[10750000,.015],[11250000,.02],[11600000,.025],[12600000,.03],[13600000,.04],[14950000,.05],[16400000,.06],[18450000,.07],[21850000,.08],[26000000,.09],[27700000,.10],[29350000,.11],[31450000,.12],[33950000,.13],[37100000,.14],[41100000,.15],[45800000,.16],[49500000,.17],[53800000,.18],[58500000,.19],[64000000,.20],[71000000,.21],[80000000,.22],[93000000,.23],[109000000,.24],[129000000,.25],[163000000,.26],[211000000,.27],[374000000,.28],[459000000,.29],[555000000,.30],[704000000,.31],[957000000,.32],[1405000000,.33],[Infinity,.34]];
// TER Category C — PMK 168/2023 Lampiran (PTKP: K/3), per 1 Jan 2024
const TER_C=[[6600000,0],[6950000,.0025],[7350000,.005],[7800000,.0075],[8850000,.01],[9800000,.0125],[10950000,.015],[11200000,.0175],[12050000,.02],[12950000,.03],[14150000,.04],[15550000,.05],[17050000,.06],[19500000,.07],[22700000,.08],[26600000,.09],[28100000,.10],[30100000,.11],[32600000,.12],[35400000,.13],[38900000,.14],[43000000,.15],[47400000,.16],[51200000,.17],[55800000,.18],[60400000,.19],[66700000,.20],[74500000,.21],[83200000,.22],[95600000,.23],[110000000,.24],[134000000,.25],[169000000,.26],[221000000,.27],[390000000,.28],[463000000,.29],[561000000,.30],[709000000,.31],[965000000,.32],[1419000000,.33],[Infinity,.34]];

function getTERTable(p){if(["TK/0","TK/1","K/0"].includes(p))return TER_A;if(["TK/2","K/1","TK/3","K/2"].includes(p))return TER_B;if(p==="K/3")return TER_C;return null;}
function getTERCat(p){const t=getTERTable(p);if(!t)return"Formula(HB)";return t===TER_A?"A":t===TER_B?"B":"C";}
function lookupTER(base,ptkp){
  const t=getTERTable(ptkp);
  if(!t){const a=PTKP[ptkp]||54000000,ann=base*12,bj=Math.min(base*.05*12,6000000),pkp=Math.max(0,ann-bj-a);return ann>0?calcProg(pkp)/ann:0;}
  for(const[u,r]of t)if(base<=u)return r;return.34;
}
const PTKP={"TK/0":54000000,"TK/1":58500000,"TK/2":63000000,"TK/3":67500000,"K/0":58500000,"K/1":63000000,"K/2":67500000,"K/3":72000000,"HB/0":108000000,"HB/1":112500000,"HB/2":117000000,"HB/3":121500000};
const P17=[{l:60000000,r:.05},{l:190000000,r:.15},{l:250000000,r:.25},{l:4500000000,r:.30},{l:Infinity,r:.35}];
const JKK_R={"I — Sangat Rendah (0.24%)":0.0024,"II — Rendah (0.54%)":0.0054,"III — Sedang (0.89%)":0.0089,"IV — Tinggi (1.27%)":0.0127,"V — Sangat Tinggi (1.74%)":0.0174};
const JP_OLD=10547400,JP_NEW=11086300,KES_CAP=12000000;
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt=n=>"Rp "+Math.round(n).toLocaleString("id-ID");
const fmt2=n=>"Rp "+n.toLocaleString("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=n=>(n*100).toFixed(2)+"%";
const rd100=v=>Math.floor(v/100)*100;
const uid=()=>Date.now()+Math.random();
const PAYROLL_PASSWORD = (() => {
  try { return (import.meta as any)?.env?.VITE_PAYROLL_PASSWORD || "payroll2025"; }
  catch { return "payroll2025"; }
})();
function calcProg(pkp){let t=0,r=pkp;for(const b of P17){if(r<=0)break;const c=Math.min(r,b.l);t+=c*b.r;r-=c;}return t;}
function bracketRows(pkp){const rows=[];let r=pkp,base=0;for(const b of P17){if(r<=0)break;const c=Math.min(r,b.l);rows.push({from:base,chunk:c,rate:b.r,tax:c*b.r});base+=c;r-=c;}return rows;}
function getSalary(hist,m){let v=0;for(const s of hist){if(parseInt(s.month)<=m)v=parseFloat(s.amount)||0;else break;}return v;}
function grossUpItem(net,ter){return ter<1?net/(1-ter):net;}

// Plain-text input that displays Rp amounts with thousand separators while storing a raw digit string
function NumberInput({value,onChange,style}){
  const display=value===""?"":Number(value).toLocaleString("id-ID");
  return <input type="text" inputMode="numeric" value={display} onChange={e=>onChange(e.target.value.replace(/\D/g,""))} style={style} />;
}

function computeBPJS(g,jkkRate,jpCap,isExpat,bpjsEnabled,kesEnabled){
  let jhtEr=0,jhtEmp=0,jpEr=0,jpEmp=0,jkkEr=0,jkmEr=0,kesEr=0,kesEmp=0;
  if(bpjsEnabled){
    const jpBase=isExpat?0:Math.min(g,jpCap);
    jhtEr=g*.037;jhtEmp=g*.02;
    jpEr=isExpat?0:jpBase*.02;jpEmp=isExpat?0:jpBase*.01;
    jkkEr=g*jkkRate;jkmEr=g*.003;
  }
  if(kesEnabled){const kb=Math.min(g,KES_CAP);kesEr=kb*.04;kesEmp=kb*.01;}
  return{jhtEr,jhtEmp,jpEr,jpEmp,jkkEr,jkmEr,kesEr,kesEmp};
}

function resolveMonth(cfg){
  const{salaryInput,salaryType,ptkp,jkkRate,jpCap,isExpat,bpjsEnabled,kesEnabled,bpjsAllowEnabled,hasTaxAllowance,taxableAllowItems,nonTaxableAllow,bonusItems,isEndMonth,cumTax,cumGross,ptkpAmt,npwpM}=cfg;

  // Gross salary
  let gross;
  if(salaryType==="net"){
    let g=salaryInput*1.05;
    for(let i=0;i<100;i++){
      const b=computeBPJS(g,jkkRate,jpCap,isExpat,bpjsEnabled,kesEnabled);
      const bpjsAllow=bpjsAllowEnabled?b.jhtEmp+b.jpEmp+b.kesEmp:0;
      const fixedTA=taxableAllowItems.filter(a=>!a.isNet).reduce((s,a)=>s+a.amount,0);
      const erTax=b.jkkEr+b.jkmEr+b.kesEr;
      const grossBonus=bonusItems.filter(a=>!a.isNet).reduce((s,a)=>s+a.amount,0);
      const terBase=g+fixedTA+bpjsAllow+erTax+grossBonus;
      const ter=lookupTER(terBase,ptkp);
      const pph=terBase*ter*npwpM;
      const ng=salaryInput+pph+b.jhtEmp+b.jpEmp+b.kesEmp;
      if(Math.abs(ng-g)<0.5)break;
      g=ng;
    }
    gross=g;
  } else {
    gross=salaryInput;
  }

  const bpjs=computeBPJS(gross,jkkRate,jpCap,isExpat,bpjsEnabled,kesEnabled);
  const bpjsAllow=bpjsAllowEnabled?bpjs.jhtEmp+bpjs.jpEmp+bpjs.kesEmp:0;
  const erTaxable=bpjs.jkkEr+bpjs.jkmEr+bpjs.kesEr;

  // Resolve net allowances/bonuses iteratively
  let rAllows=[],rBonuses=[],taFromAllows=0,taFromBonuses=0;
  for(let iter=0;iter<15;iter++){
    const fixedTA=taxableAllowItems.filter(a=>!a.isNet).reduce((s,a)=>s+a.amount,0);
    const netTA=taxableAllowItems.filter(a=>a.isNet).reduce((s,a)=>s+a.amount,0);
    const fixedBonus=bonusItems.filter(b=>!b.isNet).reduce((s,b)=>s+b.amount,0);
    const netBonus=bonusItems.filter(b=>b.isNet).reduce((s,b)=>s+b.amount,0);
    const basePre=gross+fixedTA+netTA+taFromAllows+bpjsAllow+erTaxable+fixedBonus+netBonus+taFromBonuses;
    const ter=lookupTER(basePre,ptkp);
    const newRA=taxableAllowItems.map(a=>{
      if(!a.isNet)return{...a,grossAmt:a.amount,taxAllow:0};
      const g2=grossUpItem(a.amount,ter);
      return{...a,grossAmt:g2,taxAllow:g2-a.amount};
    });
    const newTA=newRA.reduce((s,a)=>s+a.taxAllow,0);
    const basePre2=gross+newRA.reduce((s,a)=>s+a.grossAmt,0)+newTA+bpjsAllow+erTaxable+fixedBonus;
    const ter2=lookupTER(basePre2,ptkp);
    const newRB=bonusItems.map(b=>{
      if(!b.isNet)return{...b,grossAmt:b.amount,taxAllow:0};
      const g2=grossUpItem(b.amount,ter2);
      return{...b,grossAmt:g2,taxAllow:g2-b.amount};
    });
    const newTB=newRB.reduce((s,b)=>s+b.taxAllow,0);
    if(Math.abs(newTA-taFromAllows)<1&&Math.abs(newTB-taFromBonuses)<1){
      rAllows=newRA;rBonuses=newRB;taFromAllows=newTA;taFromBonuses=newTB;break;
    }
    taFromAllows=newTA;taFromBonuses=newTB;rAllows=newRA;rBonuses=newRB;
  }

  const totalTaxableGross=rAllows.reduce((s,a)=>s+a.grossAmt,0);
  const totalBonusGross=rBonuses.reduce((s,b)=>s+b.grossAmt,0);
  const totalTAItems=taFromAllows+taFromBonuses;
  const terBase=gross+totalTaxableGross+totalBonusGross+bpjsAllow+erTaxable;
  const ter=lookupTER(terBase,ptkp);

  let taxAllow2=0,pph21=0,annTax=0,refund=0,finalData=null;
  if(!isEndMonth){
    taxAllow2=salaryType==="net"&&hasTaxAllowance?grossUpItem(terBase*ter,ter):0;
    pph21=(terBase+taxAllow2)*ter*npwpM;
  } else {
    const annGross=cumGross+terBase;
    const bjAnn=Math.min(annGross*.05,6000000);
    const pkpAnn=Math.max(0,annGross-bjAnn-ptkpAmt);
    annTax=rd100(calcProg(pkpAnn)*npwpM);
    const due=annTax-cumTax;
    if(due<0){refund=Math.abs(due);pph21=0;}else pph21=due;
    taxAllow2=salaryType==="net"&&hasTaxAllowance?pph21:0;
    finalData={annGross,bjAnn,pkpAnn,annTax,prior:cumTax,due,refund,ptkpAmt,rows:bracketRows(pkpAnn)};
  }

  const empDeduct=bpjs.jhtEmp+bpjs.jpEmp+bpjs.kesEmp+pph21;
  const netPay=gross+taxAllow2+totalTaxableGross+totalTAItems+nonTaxableAllow+totalBonusGross+bpjsAllow-empDeduct;
  const erCost=gross+bpjs.jhtEr+bpjs.jpEr+bpjs.jkkEr+bpjs.jkmEr+bpjs.kesEr;
  return{gross,bpjs,bpjsAllow,erTaxable,terBase,ter,rAllows,rBonuses,taFromAllows,taFromBonuses,totalTAItems,taxAllow2,pph21,annTax,refund,finalData,empDeduct,netPay,erCost,totalTaxableGross,totalBonusGross};
}

// Sub-component for month rows (avoids fragment-in-map transpiler issues)
function MonthRow({mn,i,row,active,isFin,isExp,onToggle,emp,fmt,pct,prevRow}){
  const s={textAlign:"right",padding:"5px 4px",fontSize:11.5};
  const showBtn=active&&(row.rAllows.length>0||row.rBonuses.length>0||row.bpjsAllow>0);
  const netChg=active&&prevRow?(row.netPay-prevRow.netPay)/prevRow.netPay*100:null;
  const netChgStr=netChg!==null?(netChg>=0?"+":"")+netChg.toFixed(2)+"%":null;
  const netChgColor=netChg===null?null:netChg>0?"var(--color-text-success)":netChg<0?"var(--color-text-danger)":"var(--color-text-secondary)";
  const mainTr=(
    <tr style={{borderBottom:isExp&&showBtn?"none":"0.5px solid var(--color-border-tertiary)",background:isFin?"var(--color-background-warning)":"transparent",opacity:active?1:0.3}}>
      <td style={{padding:"5px 4px",fontSize:12,fontWeight:isFin?500:400}}>
        {mn}{isFin?" ★":""}
        {active&&row.hasBonuses&&<span style={{marginLeft:3,fontSize:10,color:"var(--color-text-info)"}}>🎁</span>}
        {active&&row.hasSalaryChange&&<span style={{marginLeft:3,fontSize:10,color:"var(--color-text-warning)"}}>↑</span>}
      </td>
      <td style={s}>{active?fmt(row.gross):"—"}</td>
      {emp.bpjsAllowEnabled&&<td style={{...s,color:"var(--color-text-warning)"}}>{active&&row.bpjsAllow>0?fmt(row.bpjsAllow):"—"}</td>}
      <td style={{...s,color:"var(--color-text-secondary)"}}>{active&&row.erTaxable>0?fmt(row.erTaxable):"—"}</td>
      <td style={s}>{active&&row.totalTaxableGross>0?fmt(row.totalTaxableGross):"—"}</td>
      <td style={{...s,fontWeight:600}}>{active?fmt(row.terBase):"—"}</td>
      <td style={s}>{active?pct(row.ter):"—"}</td>
      <td style={{...s,color:"var(--color-text-success)"}}>{active&&row.taxAllow2>0?fmt(row.taxAllow2):"—"}</td>
      <td style={{...s,color:"var(--color-text-success)"}}>{active&&row.totalTAItems>0?fmt(row.totalTAItems):"—"}</td>
      <td style={s}>{active&&row.nonTaxableAllow>0?fmt(row.nonTaxableAllow):"—"}</td>
      <td style={{...s,color:"var(--color-text-info)"}}>{active&&row.totalBonusGross>0?fmt(row.totalBonusGross):"—"}</td>
      <td style={{...s,fontWeight:600}}>{active?fmt(row.pph21):"—"}</td>
      <td style={s}>{active?fmt(row.bpjs.jhtEmp):"—"}</td>
      <td style={s}>{active?fmt(row.bpjs.jpEmp):"—"}</td>
      {emp.bpjsKesEnabled&&<td style={s}>{active?fmt(row.bpjs.kesEmp):"—"}</td>}
      <td style={{...s,fontWeight:600}}>{active?fmt(row.empDeduct):"—"}</td>
      <td style={{...s,fontWeight:600,color:"var(--color-text-success)"}}>
        {active?fmt(row.netPay):"—"}
        {netChgStr&&<span style={{display:"block",fontSize:10,color:netChgColor,fontWeight:400}}>{netChgStr}</span>}
      </td>
      <td style={{...s,textAlign:"center"}}>
        {showBtn&&<button onClick={()=>onToggle(i)} style={{fontSize:11,padding:"2px 8px",cursor:"pointer",border:"0.5px solid var(--color-border-tertiary)",borderRadius:4,background:"transparent"}}>{isExp?"▲":"▼"}</button>}
      </td>
    </tr>
  );
  if(!active||!isExp||!showBtn) return mainTr;
  const ths=["Name","Input","Type","Gross","Tax Allowance"].map(h=><th key={h} style={{textAlign:"right",padding:"3px 8px",fontSize:11,color:"#888",fontWeight:500}}>{h}</th>);
  return (
    <>
      {mainTr}
      <tr style={{borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)"}}>
        <td colSpan={20} style={{padding:"10px 16px",fontSize:12}}>
          <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
            {row.rAllows.length>0&&(
              <div>
                <p style={{fontSize:11,fontWeight:500,marginBottom:6,color:"#888"}}>ALLOWANCES</p>
                <table style={{borderCollapse:"collapse",fontSize:11.5}}>
                  <thead><tr>{ths}</tr></thead>
                  <tbody>{row.rAllows.map((a,j)=>(
                    <tr key={j} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                      <td style={{padding:"3px 8px"}}>{a.name||"—"}</td>
                      <td style={{textAlign:"right",padding:"3px 8px"}}>{fmt(a.amount)}</td>
                      <td style={{padding:"3px 8px",color:"#888"}}>{a.isNet?"Net":"Gross"}</td>
                      <td style={{textAlign:"right",padding:"3px 8px",fontWeight:500}}>{fmt(a.grossAmt)}</td>
                      <td style={{textAlign:"right",padding:"3px 8px",color:"green",fontWeight:500}}>{a.taxAllow>0?fmt(a.taxAllow):"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {row.rBonuses.length>0&&(
              <div>
                <p style={{fontSize:11,fontWeight:500,marginBottom:6,color:"#888"}}>BONUSES</p>
                <table style={{borderCollapse:"collapse",fontSize:11.5}}>
                  <thead><tr>{ths}</tr></thead>
                  <tbody>{row.rBonuses.map((b,j)=>(
                    <tr key={j} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                      <td style={{padding:"3px 8px"}}>{b.name||"—"}</td>
                      <td style={{textAlign:"right",padding:"3px 8px"}}>{fmt(b.amount)}</td>
                      <td style={{padding:"3px 8px",color:"#888"}}>{b.isNet?"Net":"Gross"}</td>
                      <td style={{textAlign:"right",padding:"3px 8px",fontWeight:500}}>{fmt(b.grossAmt)}</td>
                      <td style={{textAlign:"right",padding:"3px 8px",color:"green",fontWeight:500}}>{b.taxAllow>0?fmt(b.taxAllow):"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {row.bpjsAllow>0&&(
              <div>
                <p style={{fontSize:11,fontWeight:500,marginBottom:6,color:"#888"}}>BPJS ALLOWANCE</p>
                <table style={{borderCollapse:"collapse",fontSize:11.5}}>
                  <tbody>
                    <tr><td style={{padding:"3px 8px",color:"#888"}}>JHT employee 2%</td><td style={{textAlign:"right",padding:"3px 8px"}}>{fmt(row.bpjs.jhtEmp)}</td></tr>
                    <tr><td style={{padding:"3px 8px",color:"#888"}}>JP employee 1%</td><td style={{textAlign:"right",padding:"3px 8px"}}>{fmt(row.bpjs.jpEmp)}</td></tr>
                    {emp.bpjsKesEnabled&&<tr><td style={{padding:"3px 8px",color:"#888"}}>Kes employee 1%</td><td style={{textAlign:"right",padding:"3px 8px"}}>{fmt(row.bpjs.kesEmp)}</td></tr>}
                    <tr style={{fontWeight:500}}><td style={{padding:"3px 8px"}}>Total</td><td style={{textAlign:"right",padding:"3px 8px",color:"orange"}}>{fmt(row.bpjsAllow)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }){
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (document.getElementById("payroll-login-anim")) return;
    const style = document.createElement("style");
    style.id = "payroll-login-anim";
    style.textContent = `
      @keyframes payrollShake {
        10%,90%{transform:translateX(-1px)}
        20%,80%{transform:translateX(2px)}
        30%,50%,70%{transform:translateX(-4px)}
        40%,60%{transform:translateX(4px)}
      }
      .payroll-shake{animation:payrollShake .4s linear}
    `;
    document.head.appendChild(style);
  }, []);

  const submit = () => {
    if (pw === PAYROLL_PASSWORD) onSuccess();
    else { setPw(""); setError(true); setShakeKey(k => k + 1); }
  };

  return (
    <div style={{fontFamily:"var(--font-sans)",fontSize:14,color:"var(--color-text-primary)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",padding:"1rem"}}>
      <div style={{background:"var(--color-background-secondary)",border:"1px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:24,width:"100%",maxWidth:380}}>
        <h2 style={{fontSize:16,fontWeight:500,margin:"0 0 4px"}}>Payroll calculator</h2>
        <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 16px"}}>Enter the password to continue.</p>
        <div style={{display:"flex",gap:6}}>
          <div style={{position:"relative",flex:1}}>
            <input
              key={shakeKey}
              type={show?"text":"password"}
              value={pw}
              onChange={e=>{setPw(e.target.value);setError(false);}}
              onKeyDown={e=>{if(e.key==="Enter")submit();}}
              autoFocus
              placeholder="Password"
              className={shakeKey>0?"payroll-shake":""}
              style={{width:"100%",boxSizing:"border-box",padding:"8px 56px 8px 10px",fontSize:14,fontFamily:"var(--font-sans)",color:"var(--color-text-primary)",background:"var(--color-background-secondary)",border:`1px solid ${error?"var(--color-text-danger)":"var(--color-border-tertiary)"}`,borderRadius:"var(--border-radius-md)",outline:"none"}}
            />
            <button type="button" onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",padding:"4px 6px"}}>
              {show?"Hide":"Show"}
            </button>
          </div>
          <button type="button" onClick={submit} style={{padding:"8px 14px",fontSize:14,fontFamily:"var(--font-sans)",color:"var(--color-text-info)",background:"var(--color-background-info)",border:"0.5px solid var(--color-border-info)",borderRadius:"var(--border-radius-md)",cursor:"pointer"}}>
            Sign in
          </button>
        </div>
        {error && <p style={{fontSize:12,color:"var(--color-text-danger)",margin:"8px 0 0"}}>Incorrect password</p>}
      </div>
    </div>
  );
}

function PayrollCalculator({ onSignOut }: { onSignOut: () => void }){
  const[emp,setEmp]=useState({name:"",npwp:"",hasNpwp:true,ptkp:"TK/0",startMonth:0,endMonth:11,isExpat:false,salaryType:"gross",hasTaxAllowance:false,bpjsEnabled:true,bpjsAllowEnabled:false,jkkGroup:"I — Sangat Rendah (0.24%)",bpjsKesEnabled:true,jpCapOld:JP_OLD.toString(),jpCapNew:JP_NEW.toString(),year:new Date().getFullYear().toString()});
  const[salaryHistory,setSalaryHistory]=useState([{id:uid(),month:0,amount:"10000000"}]);
  const[allows,setAllows]=useState([]);
  const[bonuses,setBonuses]=useState([]);
  const[tab,setTab]=useState("setup");
  const[xlsxReady,setXlsxReady]=useState(false);
  const[pdfReady,setPdfReady]=useState(false);
  const[pdfMonth,setPdfMonth]=useState(11);
  const[expandedMonths,setExpandedMonths]=useState({});

  useEffect(()=>{
    if(window.XLSX){setXlsxReady(true);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload=()=>setXlsxReady(true);
    document.head.appendChild(s);
  },[]);

  useEffect(()=>{
    if(window.jspdf?.jsPDF){setPdfReady(true);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload=()=>{
      const s2=document.createElement("script");
      s2.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
      s2.onload=()=>setPdfReady(true);
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  },[]);

  const upd=(k,v)=>setEmp(e=>({...e,[k]:v}));
  const startM=parseInt(emp.startMonth),endM=parseInt(emp.endMonth);
  const terCat=getTERCat(emp.ptkp);
  const npwpM=emp.hasNpwp?1:1.2;
  const jkkRate=JKK_R[emp.jkkGroup]||0.0024;
  const jpOld=parseFloat(emp.jpCapOld)||JP_OLD;
  const jpNew=parseFloat(emp.jpCapNew)||JP_NEW;
  const activeMths=MN.map((_,i)=>i).filter(i=>i>=startM&&i<=endM);
  const sortedSalary=useMemo(()=>[...salaryHistory].sort((a,b)=>parseInt(a.month)-parseInt(b.month)),[salaryHistory]);
  const pdfMonthSafe=activeMths.includes(pdfMonth)?pdfMonth:endM;

  const updSalary=(id,k,v)=>setSalaryHistory(h=>h.map(x=>x.id===id?{...x,[k]:v}:x));
  const addSalaryChange=()=>{
    const used=new Set(sortedSalary.map(s=>parseInt(s.month)));
    const next=activeMths.find(m=>m>startM&&!used.has(m));
    if(next===undefined)return;
    setSalaryHistory(h=>[...h,{id:uid(),month:next,amount:sortedSalary[sortedSalary.length-1]?.amount||"0"}]);
  };
  const handleStartMonthChange=v=>{
    const m=parseInt(v);upd("startMonth",m);
    setSalaryHistory(h=>h.map((x,i)=>i===0?{...x,month:m}:x));
  };
  const addAllow=()=>setAllows(a=>[...a,{id:uid(),name:"",amount:"0",taxable:true,isNet:false,startMonth:startM,endMonth:endM}]);
  const updAllow=(id,k,v)=>setAllows(a=>a.map(x=>x.id===id?{...x,[k]:v}:x));
  const remAllow=id=>setAllows(a=>a.filter(x=>x.id!==id));
  const addBonus=()=>setBonuses(b=>[...b,{id:uid(),name:"",amount:"0",isNet:false,month:startM}]);
  const updBonus=(id,k,v)=>setBonuses(b=>b.map(x=>x.id===id?{...x,[k]:v}:x));
  const remBonus=id=>setBonuses(b=>b.filter(x=>x.id!==id));
  const toggleExpand=i=>setExpandedMonths(e=>({...e,[i]:!e[i]}));

  const payroll=useMemo(()=>{
    const ptkpAmt=PTKP[emp.ptkp]||54000000;
    const months=[];let cumTax=0,cumGross=0;
    for(let m=0;m<12;m++){
      if(m<startM||m>endM){months.push(null);continue;}
      const jpCap=m<2?jpOld:jpNew;
      const salaryInput=getSalary(sortedSalary,m);
      const taxableAllowItems=[];let nonTaxableAllow=0;
      for(const a of allows){
        const as=parseInt(a.startMonth),ae=parseInt(a.endMonth);
        if(m<as||m>ae)continue;
        const amt=parseFloat(a.amount)||0;
        if(a.taxable)taxableAllowItems.push({id:a.id,name:a.name,amount:amt,isNet:a.isNet});
        else nonTaxableAllow+=amt;
      }
      const bonusItems=bonuses.filter(b=>parseInt(b.month)===m).map(b=>({id:b.id,name:b.name,amount:parseFloat(b.amount)||0,isNet:b.isNet}));
      const res=resolveMonth({salaryInput,salaryType:emp.salaryType,ptkp:emp.ptkp,jkkRate,jpCap,isExpat:emp.isExpat,bpjsEnabled:emp.bpjsEnabled,kesEnabled:emp.bpjsKesEnabled,bpjsAllowEnabled:emp.bpjsAllowEnabled,hasTaxAllowance:emp.hasTaxAllowance,taxableAllowItems,nonTaxableAllow,bonusItems,isEndMonth:m===endM,cumTax,cumGross,ptkpAmt,npwpM});
      cumTax+=res.pph21;cumGross+=res.terBase;
      months.push({m,salaryInput,isEnd:m===endM,nonTaxableAllow,hasBonuses:bonusItems.length>0,hasSalaryChange:m>startM&&sortedSalary.some(s=>parseInt(s.month)===m),...res});
    }
    return months;
  },[emp,sortedSalary,allows,bonuses,npwpM,startM,endM,jkkRate,jpOld,jpNew]);

  const valid=payroll.filter(Boolean);
  const totPph=valid.reduce((s,m)=>s+m.pph21,0);
  const totNet=valid.reduce((s,m)=>s+m.netPay,0);
  const last=valid[valid.length-1];

  const exportExcel=()=>{
    if(!window.XLSX||!xlsxReady)return;
    const X=window.XLSX,wb=X.utils.book_new();
    const h=["Month","Salary Input","Gross","BPJS Allowance","Employer BPJS Taxable","TER Base","TER%","PPh21","Tax Allowance (Salary)","Tax Allowance (Items)","JHT Employee","JP Employee","Kes Employee","Employee Deduction","Net Pay","JHT Employer","JP Employer","JKK Employer","JKM Employer","Kes Employer","Employer Cost"];
    const rows=[h,...valid.map(r=>[MN[r.m],r.salaryInput,r.gross,r.bpjsAllow,r.erTaxable,r.terBase,parseFloat((r.ter*100).toFixed(4)),r.pph21,r.taxAllow2,r.totalTAItems,r.bpjs.jhtEmp,r.bpjs.jpEmp,r.bpjs.kesEmp,r.empDeduct,r.netPay,r.bpjs.jhtEr,r.bpjs.jpEr,r.bpjs.jkkEr,r.bpjs.jkmEr,r.bpjs.kesEr,r.erCost])];
    const de=1+valid.length;
    const sc=[1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
    const tot=["TOTAL"];for(let c=1;c<=20;c++){const col=X.utils.encode_col(c);tot.push(sc.includes(c)?{f:`SUM(${col}2:${col}${de})`}:"");}
    rows.push(tot);
    const ws=X.utils.aoa_to_sheet(rows);ws["!cols"]=h.map(()=>({wch:14}));
    X.utils.book_append_sheet(wb,ws,"Monthly Payroll");
    if(bonuses.length>0){
      const bh=["Name","Month","Input","Is Net","Gross Amount","Tax Allowance","TER Base","TER%","PPh21"];
      const br=[bh,...bonuses.map(b=>{const mi=parseInt(b.month),row=payroll[mi],found=row?.rBonuses?.find(x=>x.id===b.id);return[b.name||"—",MN[mi],parseFloat(b.amount)||0,b.isNet?"Yes":"No",found?.grossAmt||0,found?.taxAllow||0,row?.terBase||0,row?parseFloat((row.ter*100).toFixed(4)):0,row?.pph21||0];})];
      const ws2=X.utils.aoa_to_sheet(br);X.utils.book_append_sheet(wb,ws2,"Bonuses");
    }
    if(allows.length>0){
      const ah=["Name","Start","End","Months","Amount","Taxable","Is Net","Total"];
      const ar=[ah,...allows.map(a=>{const as=parseInt(a.startMonth),ae=parseInt(a.endMonth),cnt=valid.filter(r=>r.m>=as&&r.m<=ae).length;return[a.name||"—",MN[as],MN[ae],cnt,parseFloat(a.amount)||0,a.taxable?"Yes":"No",a.isNet?"Yes":"No",(parseFloat(a.amount)||0)*cnt];})];
      const ws3=X.utils.aoa_to_sheet(ar);X.utils.book_append_sheet(wb,ws3,"Allowances");
    }
    const sh=["Month","Type","Amount"];
    const sr=[sh,...sortedSalary.map(s=>[MN[parseInt(s.month)],emp.salaryType,parseFloat(s.amount)||0])];
    const ws4=X.utils.aoa_to_sheet(sr);X.utils.book_append_sheet(wb,ws4,"Salary History");
    const bph=["Month","JP Cap","JKK Employer","JKM Employer","Kes Employer","Employer Taxable","JHT Employer","JP Employer","JHT Employee","JP Employee","Kes Employee","Total Employer","Total Employee"];
    const bpr=[bph,...valid.map(r=>[MN[r.m],r.m<2?jpOld:jpNew,r.bpjs.jkkEr,r.bpjs.jkmEr,r.bpjs.kesEr,r.erTaxable,r.bpjs.jhtEr,r.bpjs.jpEr,r.bpjs.jhtEmp,r.bpjs.jpEmp,r.bpjs.kesEmp,r.bpjs.jhtEr+r.bpjs.jpEr+r.bpjs.jkkEr+r.bpjs.jkmEr+r.bpjs.kesEr,r.bpjs.jhtEmp+r.bpjs.jpEmp+r.bpjs.kesEmp])];
    const ws5=X.utils.aoa_to_sheet(bpr);X.utils.book_append_sheet(wb,ws5,"BPJS Breakdown");
    const fd=last?.finalData;
    const ann=[[`TAX ANNUALIZATION — ${emp.name||"Employee"} (${emp.year})`],[""],["Field","Value"],["Name",emp.name||"—"],["NPWP",emp.npwp||"—"],["PTKP",emp.ptkp],["PTKP Amt",PTKP[emp.ptkp]||54000000],["TER Cat",terCat],["Expat",emp.isExpat?"Yes":"No"],["NPWP surcharge",emp.hasNpwp?"No":"Yes"],[""],["1. Annual taxable gross",fd?.annGross||0],["2. Less Biaya Jabatan",fd?.bjAnn||0],["3. Less PTKP",fd?.ptkpAmt||0],["4. PKP",fd?.pkpAnn||0],[""],["5. Pasal 17"],  ...(fd?.rows||[]).map(b=>[`${fmt(b.from)}–${fmt(b.from+b.chunk)}`,`${(b.rate*100).toFixed(0)}%`,Math.round(b.tax)]),[""],["6. Annual PPh21",fd?.annTax||0],["7. Prior withheld",fd?.prior||0],["8. Due "+MN[endM],Math.max(0,fd?.due||0)],["9. Refund",fd?.refund||0]];
    const ws6=X.utils.aoa_to_sheet(ann);ws6["!cols"]=[{wch:48},{wch:18},{wch:20}];
    X.utils.book_append_sheet(wb,ws6,"Tax Annualization");
    const wbout=X.write(wb,{bookType:"xlsx",type:"array"});
    const blob=new Blob([wbout],{type:"application/octet-stream"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`Payroll_${emp.name||"Employee"}_${emp.year}.xlsx`;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(url);document.body.removeChild(a);},100);
  };

  const exportPDF=()=>{
    if(!window.jspdf||!pdfReady)return;
    const row=payroll[pdfMonthSafe];
    if(!row)return;
    const{jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:"pt",format:"a4"});
    const pageW=doc.internal.pageSize.getWidth();
    const margin=40;
    let y=50;

    doc.setFont("helvetica","bold");doc.setFontSize(14);
    doc.text("Payslip",margin,y);
    doc.setFont("helvetica","normal");doc.setFontSize(9);
    doc.text(`Generated ${new Date().toLocaleDateString("id-ID")}`,pageW-margin,y,{align:"right"});

    y+=20;
    doc.autoTable({
      startY:y,margin:{left:margin},tableWidth:pageW-2*margin,
      body:[
        ["Name",emp.name||"—","Period",`${MN[pdfMonthSafe]} ${emp.year}`],
        ["NPWP",emp.npwp||"—","Tax Status",emp.ptkp],
      ],
      theme:"plain",styles:{fontSize:9,cellPadding:3},
      columnStyles:{0:{fontStyle:"bold",cellWidth:70},2:{fontStyle:"bold",cellWidth:70}},
    });
    y=doc.lastAutoTable.finalY+12;

    const incomes=[["Basic Salary",fmt2(row.gross)]];
    row.rAllows.forEach(a=>{if(a.grossAmt>0)incomes.push([a.name||"Allowance",fmt2(a.grossAmt)]);});
    row.rBonuses.forEach(b=>{if(b.grossAmt>0)incomes.push([b.name||"Bonus",fmt2(b.grossAmt)]);});
    if(row.taxAllow2>0)incomes.push(["Tax Allowance (Salary)",fmt2(row.taxAllow2)]);
    if(row.totalTAItems>0)incomes.push(["Tax Allowance (Items)",fmt2(row.totalTAItems)]);
    if(row.nonTaxableAllow>0)incomes.push(["Non-Taxable Allowance",fmt2(row.nonTaxableAllow)]);
    if(emp.bpjsAllowEnabled&&row.bpjsAllow>0)incomes.push(["BPJS Allowance",fmt2(row.bpjsAllow)]);
    if(emp.bpjsKesEnabled)incomes.push(["BPJS Kesehatan — Employer",fmt2(row.bpjs.kesEr)]);
    if(emp.bpjsEnabled){
      incomes.push(["BPJS JHT — Employer",fmt2(row.bpjs.jhtEr)]);
      incomes.push(["BPJS JKK — Employer",fmt2(row.bpjs.jkkEr)]);
      incomes.push(["BPJS JKM — Employer",fmt2(row.bpjs.jkmEr)]);
      if(!emp.isExpat)incomes.push(["BPJS JP — Employer",fmt2(row.bpjs.jpEr)]);
    }
    const erBpjsTotal=row.bpjs.jhtEr+row.bpjs.jpEr+row.bpjs.jkkEr+row.bpjs.jkmEr+row.bpjs.kesEr;
    const totalIncomes=row.gross+row.totalTaxableGross+row.totalTAItems+row.nonTaxableAllow+row.totalBonusGross+row.taxAllow2+row.bpjsAllow+erBpjsTotal;

    const deductions=[];
    if(emp.bpjsKesEnabled)deductions.push(["BPJS Kesehatan — Employee",fmt2(row.bpjs.kesEmp)]);
    if(emp.bpjsEnabled){
      deductions.push(["BPJS JHT — Employee",fmt2(row.bpjs.jhtEmp)]);
      if(!emp.isExpat)deductions.push(["BPJS JP — Employee",fmt2(row.bpjs.jpEmp)]);
    }
    deductions.push(["PPh 21",fmt2(row.pph21)]);
    if(emp.bpjsKesEnabled)deductions.push(["BPJS Kesehatan — Employer",fmt2(row.bpjs.kesEr)]);
    if(emp.bpjsEnabled){
      deductions.push(["BPJS JHT — Employer",fmt2(row.bpjs.jhtEr)]);
      deductions.push(["BPJS JKK — Employer",fmt2(row.bpjs.jkkEr)]);
      deductions.push(["BPJS JKM — Employer",fmt2(row.bpjs.jkmEr)]);
      if(!emp.isExpat)deductions.push(["BPJS JP — Employer",fmt2(row.bpjs.jpEr)]);
    }
    const totalDeductions=row.empDeduct+erBpjsTotal;

    const colW=(pageW-2*margin-12)/2;
    doc.setFont("helvetica","bold");doc.setFontSize(10);
    doc.text("Incomes",margin,y);
    doc.text("Deductions",margin+colW+12,y);
    doc.setFont("helvetica","normal");
    y+=6;

    doc.autoTable({
      startY:y,margin:{left:margin},tableWidth:colW,
      head:[["Item","Amount"]],body:incomes,theme:"grid",
      styles:{fontSize:8,cellPadding:3},headStyles:{fillColor:[235,235,235],textColor:20},
      columnStyles:{1:{halign:"right"}},
    });
    const incomesY=doc.lastAutoTable.finalY;

    doc.autoTable({
      startY:y,margin:{left:margin+colW+12},tableWidth:colW,
      head:[["Item","Amount"]],body:deductions,theme:"grid",
      styles:{fontSize:8,cellPadding:3},headStyles:{fillColor:[235,235,235],textColor:20},
      columnStyles:{1:{halign:"right"}},
    });
    const deductionsY=doc.lastAutoTable.finalY;

    y=Math.max(incomesY,deductionsY)+6;
    doc.autoTable({
      startY:y,margin:{left:margin},tableWidth:colW,
      body:[["Total Incomes",fmt2(totalIncomes)]],theme:"grid",
      styles:{fontSize:8,cellPadding:3,fontStyle:"bold"},columnStyles:{1:{halign:"right"}},
    });
    const totIncY=doc.lastAutoTable.finalY;
    doc.autoTable({
      startY:y,margin:{left:margin+colW+12},tableWidth:colW,
      body:[["Total Deductions",fmt2(totalDeductions)]],theme:"grid",
      styles:{fontSize:8,cellPadding:3,fontStyle:"bold"},columnStyles:{1:{halign:"right"}},
    });
    const totDedY=doc.lastAutoTable.finalY;

    y=Math.max(totIncY,totDedY)+10;
    doc.autoTable({
      startY:y,margin:{left:margin},tableWidth:pageW-2*margin,
      body:[["Take Home Pay",fmt2(totalIncomes-totalDeductions)]],theme:"grid",
      styles:{fontSize:10,cellPadding:5,fontStyle:"bold"},
      columnStyles:{1:{halign:"right"}},
      bodyStyles:{fillColor:[245,250,245]},
    });
    y=doc.lastAutoTable.finalY+10;

    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(120);
    doc.text(`TER ${terCat} (${emp.ptkp}) · TER rate ${pct(row.ter)} · TER base ${fmt(row.terBase)}${emp.hasNpwp?"":" · No NPWP: +20% PPh 21"}`,margin,y);

    doc.save(`Payslip_${(emp.name||"Employee").replace(/\s+/g,"_")}_${MN[pdfMonthSafe]}_${emp.year}.pdf`);
  };

  const tabSt=t=>({padding:"8px 14px",fontSize:13,cursor:"pointer",border:"none",borderBottom:tab===t?"2px solid var(--color-text-primary)":"2px solid transparent",background:"transparent",color:tab===t?"var(--color-text-primary)":"var(--color-text-secondary)",fontWeight:tab===t?500:400});
  const lbl={fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4};
  const td={textAlign:"right",padding:"5px 4px",fontSize:11.5};
  const th={...td,color:"var(--color-text-secondary)",fontWeight:500,borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"6px 4px",whiteSpace:"nowrap"};
  const card=(label,val,sub)=>(
    <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"1rem"}}>
      <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 4px"}}>{label}</p>
      <p style={{fontSize:15,fontWeight:500,margin:0}}>{fmt(val)}</p>
      {sub&&<p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"2px 0 0"}}>{sub}</p>}
    </div>
  );

  return (
    <div style={{fontFamily:"var(--font-sans)",fontSize:14,color:"var(--color-text-primary)",maxWidth:1200,margin:"0 auto",padding:"1rem 0"}}>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Indonesia payroll calculator</h2>
      <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:"0 0 16px"}}>
        PPh 21 TER PMK 168/2023 · BPJS TK + Kesehatan · Net gross-up · Expat · BPJS Allowance · Pasal 17 finalization
        <span style={{marginLeft:8,padding:"2px 8px",background:"var(--color-background-info)",color:"var(--color-text-info)",borderRadius:"var(--border-radius-md)",fontSize:11}}>TER {terCat} · {emp.ptkp}{emp.isExpat?" · EXPAT":""}</span>
      </p>

      <div style={{borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:20,display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
        {["setup","allowances","bonuses","monthly","summary","annualization"].map(t=>(
          <button key={t} style={tabSt(t)} onClick={()=>setTab(t)}>
            {t==="setup"?"Employee setup":t==="allowances"?`Allowances${allows.length?` (${allows.length})`:""}`:t==="bonuses"?`Bonuses${bonuses.length?` (${bonuses.length})`:""}`:t==="monthly"?"Monthly payroll":t==="summary"?"Year summary":"Tax annualization"}
          </button>
        ))}
        <select value={pdfMonthSafe} onChange={e=>setPdfMonth(parseInt(e.target.value))} style={{marginLeft:"auto",padding:"6px 8px",fontSize:12,boxSizing:"border-box"}}>
          {activeMths.map(i=><option key={i} value={i}>{MN[i]}</option>)}
        </select>
        <button onClick={exportPDF} disabled={!pdfReady} style={{padding:"6px 16px",fontSize:13,background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:"var(--border-radius-md)",cursor:pdfReady?"pointer":"not-allowed",opacity:pdfReady?1:0.5}}>{pdfReady?"Export PDF":"Loading…"}</button>
        <button onClick={exportExcel} disabled={!xlsxReady} style={{padding:"6px 16px",fontSize:13,background:"var(--color-background-info)",color:"var(--color-text-info)",border:"0.5px solid var(--color-border-info)",borderRadius:"var(--border-radius-md)",cursor:xlsxReady?"pointer":"not-allowed",opacity:xlsxReady?1:0.5}}>{xlsxReady?"Export Excel":"Loading…"}</button>
        <button onClick={onSignOut} style={{padding:"6px 12px",fontSize:12,fontFamily:"var(--font-sans)",color:"var(--color-text-secondary)",background:"transparent",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",cursor:"pointer"}}>Sign out</button>
      </div>

      {/* SETUP */}
      {tab==="setup"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div><label style={lbl}>Employee name</label><input value={emp.name} onChange={e=>upd("name",e.target.value)} placeholder="Full name" style={{width:"100%",boxSizing:"border-box"}} /></div>
          <div><label style={lbl}>Tax year</label><input value={emp.year} onChange={e=>upd("year",e.target.value)} style={{width:"100%",boxSizing:"border-box"}} /></div>
          <div><label style={lbl}>NPWP</label><input value={emp.npwp} onChange={e=>upd("npwp",e.target.value)} placeholder="XX.XXX.XXX.X-XXX.XXX" style={{width:"100%",boxSizing:"border-box"}} /></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,justifyContent:"flex-end",paddingBottom:2}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={emp.hasNpwp} onChange={e=>upd("hasNpwp",e.target.checked)} />Has NPWP (without = +20% PPh 21)</label>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={emp.isExpat} onChange={e=>upd("isExpat",e.target.checked)} />Expatriate employee (JP not applicable)</label>
          </div>
          <div><label style={lbl}>PTKP status</label>
            <select value={emp.ptkp} onChange={e=>upd("ptkp",e.target.value)} style={{width:"100%",boxSizing:"border-box"}}>
              {Object.keys(PTKP).map(k=><option key={k} value={k}>{k} — {fmt(PTKP[k])}/year [TER {getTERCat(k)}]</option>)}
            </select>
          </div>
          <div></div>
          <div><label style={lbl}>Employment start month</label>
            <select value={emp.startMonth} onChange={e=>handleStartMonthChange(e.target.value)} style={{width:"100%",boxSizing:"border-box"}}>
              {MN.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Tax finalization / end month</label>
            <select value={emp.endMonth} onChange={e=>upd("endMonth",parseInt(e.target.value))} style={{width:"100%",boxSizing:"border-box"}}>
              {MN.map((m,i)=><option key={i} value={i} disabled={i<startM}>{m}{i===11?" (Dec — standard)":""}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Salary type</label>
            <select value={emp.salaryType} onChange={e=>upd("salaryType",e.target.value)} style={{width:"100%",boxSizing:"border-box"}}>
              <option value="gross">Gross (employee bears PPh 21)</option>
              <option value="net">Net take-home (employer grosses up)</option>
            </select>
          </div>
          <div style={{display:"flex",alignItems:"flex-end"}}>
            {emp.salaryType==="net"&&<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,paddingBottom:2}}><input type="checkbox" checked={emp.hasTaxAllowance} onChange={e=>upd("hasTaxAllowance",e.target.checked)} />Show tunjangan pajak as line item</label>}
          </div>
          <div style={{gridColumn:"1/-1",borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <p style={{fontSize:13,fontWeight:500,margin:0}}>{emp.salaryType==="gross"?"Gross":"Net"} salary history</p>
              <button onClick={addSalaryChange} style={{fontSize:12,padding:"4px 12px"}} disabled={sortedSalary.length>=activeMths.length}>+ Add salary change</button>
            </div>
            <p style={{fontSize:11,color:"var(--color-text-secondary)",margin:"0 0 10px"}}>First entry is the starting salary. Add rows for each mid-period change.</p>
            {sortedSalary.map((s,idx)=>{
              const isFirst=idx===0;
              const used=new Set(sortedSalary.filter(x=>x.id!==s.id).map(x=>parseInt(x.month)));
              return(
                <div key={s.id} style={{display:"grid",gridTemplateColumns:"160px 1fr auto",gap:12,marginBottom:8,alignItems:"end"}}>
                  <div>
                    <label style={lbl}>{isFirst?"Effective from (start)":"Effective from"}</label>
                    {isFirst
                      ?<div style={{padding:"6px 10px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",fontSize:13,color:"var(--color-text-secondary)"}}>{MN[parseInt(s.month)]}</div>
                      :<select value={s.month} onChange={e=>updSalary(s.id,"month",parseInt(e.target.value))} style={{width:"100%",boxSizing:"border-box"}}>
                        {activeMths.filter(m=>m>startM&&(!used.has(m)||m===parseInt(s.month))).map(i=><option key={i} value={i}>{MN[i]}</option>)}
                      </select>}
                  </div>
                  <div>
                    <label style={lbl}>{emp.salaryType==="gross"?"Gross":"Net"} salary (Rp/month)</label>
                    <NumberInput value={s.amount} onChange={v=>updSalary(s.id,"amount",v)} style={{width:"100%",boxSizing:"border-box"}} />
                  </div>
                  <div style={{paddingBottom:2}}>
                    <label style={{...lbl,color:"transparent"}}>.</label>
                    {!isFirst?<button onClick={()=>setSalaryHistory(h=>h.filter(x=>x.id!==s.id))} style={{fontSize:13,padding:"6px 10px",color:"var(--color-text-danger)",border:"none",background:"transparent",cursor:"pointer"}}>✕</button>:<div style={{width:36}}/>}
                  </div>
                </div>
              );
            })}
            {sortedSalary.length>0&&(
              <div style={{marginTop:8,fontSize:11,display:"flex",flexWrap:"wrap",gap:4}}>
                {sortedSalary.map((s,idx)=>{
                  const from=parseInt(s.month),to=idx<sortedSalary.length-1?parseInt(sortedSalary[idx+1].month)-1:endM;
                  return <span key={s.id} style={{padding:"2px 8px",background:"var(--color-background-info)",color:"var(--color-text-info)",borderRadius:"var(--border-radius-md)"}}>{MN[from]}{from!==to?`–${MN[to]}`:""}: {fmt(parseFloat(s.amount)||0)}</span>;
                })}
              </div>
            )}
          </div>
          <div style={{gridColumn:"1/-1",borderTop:"0.5px solid var(--color-border-tertiary)",paddingTop:14}}>
            <p style={{fontSize:13,fontWeight:500,marginBottom:10}}>BPJS Ketenagakerjaan</p>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginBottom:10}}><input type="checkbox" checked={emp.bpjsEnabled} onChange={e=>upd("bpjsEnabled",e.target.checked)} />Enable BPJS TK (JHT, JP, JKK, JKM)</label>
            {emp.bpjsEnabled&&<div style={{marginLeft:20,display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12,marginBottom:10}}>
              <div><label style={lbl}>Risk group (JKK rate)</label>
                <select value={emp.jkkGroup} onChange={e=>upd("jkkGroup",e.target.value)} style={{width:"100%",boxSizing:"border-box"}}>
                  {Object.keys(JKK_R).map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div><label style={lbl}>JP cap Jan–Feb (Rp)</label><NumberInput value={emp.jpCapOld} onChange={v=>upd("jpCapOld",v)} style={{width:"100%",boxSizing:"border-box"}} /></div>
              <div><label style={lbl}>JP cap Mar–Dec (Rp)</label><NumberInput value={emp.jpCapNew} onChange={v=>upd("jpCapNew",v)} style={{width:"100%",boxSizing:"border-box"}} /></div>
              <div style={{gridColumn:"1/-1",fontSize:11,color:"var(--color-text-secondary)"}}>JHT: Employer 3.7% + Employee 2% · JP: Employer 2% + Employee 1% (capped{emp.isExpat?", exempt for expat":""}) · JKM: Employer 0.3%</div>
            </div>}
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginBottom:6}}><input type="checkbox" checked={emp.bpjsAllowEnabled} onChange={e=>upd("bpjsAllowEnabled",e.target.checked)} />Employer bears employee BPJS share (BPJS Allowance — taxable income)</label>
            {emp.bpjsAllowEnabled&&<p style={{fontSize:11,color:"var(--color-text-secondary)",marginLeft:22,marginTop:0}}>Adds JHT Employee + JP Employee + Kes Employee as taxable allowance. Included in TER base.</p>}
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={emp.bpjsKesEnabled} onChange={e=>upd("bpjsKesEnabled",e.target.checked)} />Enable BPJS Kesehatan (Employer 4% + Employee 1%, base capped at {fmt(KES_CAP)}/month)</label>
            {emp.bpjsKesEnabled&&<p style={{fontSize:11,color:"var(--color-text-secondary)",marginLeft:22,marginTop:4}}>Max employer: {fmt(KES_CAP*.04)}/month · Max employee: {fmt(KES_CAP*.01)}/month · Employer share included in taxable employer BPJS</p>}
          </div>
        </div>
      )}

      {/* ALLOWANCES */}
      {tab==="allowances"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0}}>Set period, tax treatment, and gross/net. Net allowances are grossed up using that month's TER — individual tax allowances shown per item.</p>
            <button onClick={addAllow} style={{fontSize:13,padding:"6px 14px"}}>+ Add allowance</button>
          </div>
          {allows.length===0&&<div style={{padding:"32px 0",textAlign:"center",color:"var(--color-text-secondary)",fontSize:13}}>No allowances added.</div>}
          {allows.map(a=>{
            const firstM=valid.find(r=>r.m>=parseInt(a.startMonth)&&r.m<=parseInt(a.endMonth));
            const preview=firstM?.rAllows?.find(x=>x.id===a.id);
            return(
              <div key={a.id} style={{marginBottom:12,padding:"12px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 0.7fr 0.7fr 1fr 1fr auto",gap:8,alignItems:"end"}}>
                  <div><label style={lbl}>Name</label><input value={a.name} onChange={e=>updAllow(a.id,"name",e.target.value)} placeholder="e.g. Housing" style={{width:"100%",boxSizing:"border-box"}} /></div>
                  <div><label style={lbl}>Amount (Rp/month)</label><NumberInput value={a.amount} onChange={v=>updAllow(a.id,"amount",v)} style={{width:"100%",boxSizing:"border-box"}} /></div>
                  <div><label style={lbl}>From</label>
                    <select value={a.startMonth} onChange={e=>updAllow(a.id,"startMonth",parseInt(e.target.value))} style={{width:"100%",boxSizing:"border-box"}}>
                      {activeMths.map(i=><option key={i} value={i}>{MN[i]}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>To</label>
                    <select value={a.endMonth} onChange={e=>updAllow(a.id,"endMonth",parseInt(e.target.value))} style={{width:"100%",boxSizing:"border-box"}}>
                      {activeMths.filter(i=>i>=parseInt(a.startMonth)).map(i=><option key={i} value={i}>{MN[i]}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Tax treatment</label>
                    <select value={a.taxable?"t":"n"} onChange={e=>updAllow(a.id,"taxable",e.target.value==="t")} style={{width:"100%",boxSizing:"border-box"}}>
                      <option value="t">Taxable</option><option value="n">Non-taxable (natura)</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Input as</label>
                    <select value={a.isNet?"net":"gross"} onChange={e=>updAllow(a.id,"isNet",e.target.value==="net")} style={{width:"100%",boxSizing:"border-box"}} disabled={!a.taxable}>
                      <option value="gross">Gross</option><option value="net">Net (grossed up)</option>
                    </select>
                  </div>
                  <div style={{paddingBottom:2}}><label style={{...lbl,color:"transparent"}}>.</label>
                    <button onClick={()=>remAllow(a.id)} style={{fontSize:13,padding:"6px 10px",color:"var(--color-text-danger)",border:"none",background:"transparent",cursor:"pointer"}}>✕</button>
                  </div>
                </div>
                <div style={{marginTop:8,fontSize:11,color:"var(--color-text-secondary)",display:"flex",gap:14,flexWrap:"wrap"}}>
                  <span>{MN[parseInt(a.startMonth)]}–{MN[parseInt(a.endMonth)]} ({Math.max(0,parseInt(a.endMonth)-parseInt(a.startMonth)+1)} months)</span>
                  <span>{a.taxable?(a.isNet?"Net — grossed up":"Gross — taxable"):"Non-taxable"}</span>
                  {preview&&a.isNet&&a.taxable&&<span style={{color:"var(--color-text-primary)"}}>Gross: <strong>{fmt(preview.grossAmt)}</strong> · Tax Allowance: <strong style={{color:"green"}}>{fmt(preview.taxAllow)}</strong> (from {MN[firstM.m]})</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BONUSES */}
      {tab==="bonuses"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0}}>One-time bonuses. Net bonuses are grossed up using that month's TER rate.</p>
            <button onClick={addBonus} style={{fontSize:13,padding:"6px 14px"}}>+ Add bonus</button>
          </div>
          <div style={{marginBottom:14,padding:"8px 12px",background:"var(--color-background-warning)",borderRadius:"var(--border-radius-md)",fontSize:12}}>
            <strong>PMK 168/2023:</strong> Bonus (gross or grossed-up) is added to the month's bruto. The combined total determines the TER rate and tax base.
          </div>
          {bonuses.length===0&&<div style={{padding:"32px 0",textAlign:"center",color:"var(--color-text-secondary)",fontSize:13}}>No bonuses added.</div>}
          {bonuses.map(b=>{
            const mi=parseInt(b.month),row=payroll[mi],found=row?.rBonuses?.find(x=>x.id===b.id),isFinMonth=mi===endM;
            return(
              <div key={b.id} style={{marginBottom:12,padding:"12px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 0.8fr 0.8fr auto",gap:8,alignItems:"end"}}>
                  <div><label style={lbl}>Bonus name</label><input value={b.name} onChange={e=>updBonus(b.id,"name",e.target.value)} placeholder="e.g. THR" style={{width:"100%",boxSizing:"border-box"}} /></div>
                  <div><label style={lbl}>Amount (Rp)</label><NumberInput value={b.amount} onChange={v=>updBonus(b.id,"amount",v)} style={{width:"100%",boxSizing:"border-box"}} /></div>
                  <div><label style={lbl}>Pay month</label>
                    <select value={b.month} onChange={e=>updBonus(b.id,"month",parseInt(e.target.value))} style={{width:"100%",boxSizing:"border-box"}}>
                      {activeMths.map(i=><option key={i} value={i}>{MN[i]}{i===endM?" (fin.)":""}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Input as</label>
                    <select value={b.isNet?"net":"gross"} onChange={e=>updBonus(b.id,"isNet",e.target.value==="net")} style={{width:"100%",boxSizing:"border-box"}}>
                      <option value="gross">Gross</option><option value="net">Net (grossed up)</option>
                    </select>
                  </div>
                  <div style={{paddingBottom:2}}><label style={{...lbl,color:"transparent"}}>.</label>
                    <button onClick={()=>remBonus(b.id)} style={{fontSize:13,padding:"6px 10px",color:"var(--color-text-danger)",border:"none",background:"transparent",cursor:"pointer"}}>✕</button>
                  </div>
                </div>
                <div style={{marginTop:8,fontSize:11,display:"flex",gap:14,flexWrap:"wrap",color:"var(--color-text-secondary)"}}>
                  {row&&!isFinMonth&&found&&(
                    <>
                      <span>Input: <strong>{fmt(parseFloat(b.amount)||0)}</strong> ({b.isNet?"net":"gross"})</span>
                      {b.isNet&&<span style={{color:"var(--color-text-primary)"}}>Grossed-up: <strong>{fmt(found.grossAmt)}</strong> · Tax Allowance: <strong style={{color:"green"}}>{fmt(found.taxAllow)}</strong></span>}
                      <span>TER base: <strong>{fmt(row.terBase)}</strong> · TER: <strong>{pct(row.ter)}</strong> · PPh 21: <strong>{fmt(row.pph21)}</strong></span>
                    </>
                  )}
                  {isFinMonth&&<span style={{color:"orange"}}>⚠ In finalization month — included in Pasal 17 recalculation</span>}
                </div>
              </div>
            );
          })}
          {bonuses.length>0&&<div style={{marginTop:12,padding:"10px 14px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",fontSize:12}}>
            Total bonuses (gross): <strong>{fmt(valid.reduce((s,m)=>s+m.totalBonusGross,0))}</strong>
          </div>}
        </div>
      )}

      {/* MONTHLY */}
      {tab==="monthly"&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11.5,minWidth:1100}}>
            <thead>
              <tr style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <th style={{...th,textAlign:"left"}}>Month</th>
                <th style={th}>Gross salary</th>
                {emp.bpjsAllowEnabled&&<th style={{...th,color:"orange"}}>BPJS allowance</th>}
                <th style={{...th,color:"var(--color-text-secondary)"}}>Employer BPJS taxable</th>
                <th style={th}>Taxable allowance</th>
                <th style={{...th,fontWeight:600}}>TER base</th>
                <th style={th}>TER rate</th>
                <th style={{...th,color:"green"}}>Tax allowance (salary)</th>
                <th style={{...th,color:"green"}}>Tax allowance (items)</th>
                <th style={th}>Non-taxable allowance</th>
                <th style={{...th,color:"var(--color-text-info)"}}>Bonus (gross)</th>
                <th style={{...th,fontWeight:600}}>PPh 21</th>
                <th style={th}>JHT employee</th>
                <th style={th}>JP employee</th>
                {emp.bpjsKesEnabled&&<th style={th}>Kes employee</th>}
                <th style={{...th,fontWeight:600}}>Employee deduction</th>
                <th style={{...th,fontWeight:600,color:"green"}}>Net pay</th>
                <th style={{...th,textAlign:"center"}}>▼</th>
              </tr>
            </thead>
            <tbody>
              {MN.map((mn,i)=>{
                const row=payroll[i],active=row!==null,isFin=active&&row.isEnd,isExp=!!expandedMonths[i];
                const showDetail=active&&(row.rAllows.length>0||row.rBonuses.length>0||row.bpjsAllow>0);
                const idx=active?valid.findIndex(r=>r.m===i):-1;
                const prevRow=idx>0?valid[idx-1]:null;
                return <MonthRow key={i} mn={mn} i={i} row={row} active={active} isFin={isFin} isExp={isExp} showDetail={showDetail} onToggle={toggleExpand} emp={emp} fmt={fmt} pct={pct} prevRow={prevRow} />;
              })}
            </tbody>
            <tfoot>
              <tr style={{borderTop:"1px solid var(--color-border-primary)",fontWeight:600,fontSize:12}}>
                <td style={{padding:"7px 4px"}}>Total</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.gross,0))}</td>
                {emp.bpjsAllowEnabled&&<td style={td}>{fmt(valid.reduce((s,m)=>s+m.bpjsAllow,0))}</td>}
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.erTaxable,0))}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.totalTaxableGross,0))}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.terBase,0))}</td>
                <td/>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.taxAllow2,0))}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.totalTAItems,0))}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.nonTaxableAllow,0))}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.totalBonusGross,0))}</td>
                <td style={td}>{fmt(totPph)}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.bpjs.jhtEmp,0))}</td>
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.bpjs.jpEmp,0))}</td>
                {emp.bpjsKesEnabled&&<td style={td}>{fmt(valid.reduce((s,m)=>s+m.bpjs.kesEmp,0))}</td>}
                <td style={td}>{fmt(valid.reduce((s,m)=>s+m.empDeduct,0))}</td>
                <td style={{...td,color:"green"}}>{fmt(totNet)}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
          {last?.finalData&&<div style={{marginTop:10,padding:"8px 12px",background:"var(--color-background-warning)",borderRadius:"var(--border-radius-md)",fontSize:12}}>
            ★ {MN[endM]} = Pasal 17 finalization. {last.finalData.refund>0?<span style={{color:"green",fontWeight:500}}>Est. refund: {fmt(last.finalData.refund)}</span>:<span>Additional payable: {fmt(Math.max(0,last.finalData.due))}</span>}
          </div>}
        </div>
      )}

      {/* SUMMARY */}
      {tab==="summary"&&(
        <div>
          <p style={{fontSize:13,fontWeight:500,marginBottom:12}}>Income &amp; tax</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:24}}>
            {card("Total gross salary",valid.reduce((s,m)=>s+m.gross,0))}
            {emp.bpjsAllowEnabled&&card("Total BPJS allowance",valid.reduce((s,m)=>s+m.bpjsAllow,0),"taxable, borne by employer")}
            {card("Total TER base",valid.reduce((s,m)=>s+m.terBase,0),"all taxable items")}
            {card("Total tax allowance (items)",valid.reduce((s,m)=>s+m.totalTAItems,0),"net allows + bonuses")}
            {card("Total PPh 21",totPph)}
            {card("Total net take-home",totNet)}
            {last?.finalData?.refund>0&&card("Est. tax refund",last.finalData.refund)}
          </div>
          <p style={{fontSize:13,fontWeight:500,marginBottom:12}}>BPJS — employee</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:24}}>
            {card("JHT employee (2%)",valid.reduce((s,m)=>s+m.bpjs.jhtEmp,0))}
            {card("JP employee (1%)",valid.reduce((s,m)=>s+m.bpjs.jpEmp,0),emp.isExpat?"exempt (expat)":"JP wage cap")}
            {card("BpjsKes employee (1%)",valid.reduce((s,m)=>s+m.bpjs.kesEmp,0),emp.bpjsKesEnabled?"cap Rp 12jt":"disabled")}
            {card("Total employee BPJS",valid.reduce((s,m)=>s+m.bpjs.jhtEmp+m.bpjs.jpEmp+m.bpjs.kesEmp,0))}
          </div>
          <p style={{fontSize:13,fontWeight:500,marginBottom:12}}>BPJS — employer</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:24}}>
            {card("JHT employer (3.7%)",valid.reduce((s,m)=>s+m.bpjs.jhtEr,0))}
            {card("JP employer (2%)",valid.reduce((s,m)=>s+m.bpjs.jpEr,0),emp.isExpat?"exempt (expat)":"JP wage cap")}
            {card("JKK employer",valid.reduce((s,m)=>s+m.bpjs.jkkEr,0),"taxable to employee")}
            {card("JKM employer (0.3%)",valid.reduce((s,m)=>s+m.bpjs.jkmEr,0),"taxable to employee")}
            {card("BpjsKes employer (4%)",valid.reduce((s,m)=>s+m.bpjs.kesEr,0),emp.bpjsKesEnabled?"cap Rp 12jt · taxable":"disabled")}
            {card("Total employer BPJS",valid.reduce((s,m)=>s+m.bpjs.jhtEr+m.bpjs.jpEr+m.bpjs.jkkEr+m.bpjs.jkmEr+m.bpjs.kesEr,0))}
            {card("Taxable employer BPJS",valid.reduce((s,m)=>s+m.erTaxable,0),"JKK + JKM + Kes employer → TER base")}
          </div>
          <p style={{fontSize:13,fontWeight:500,marginBottom:10}}>BPJS month-by-month</p>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["Month","JP Cap","JKK Employer","JKM Employer","Kes Employer","Employer Taxable","JHT Employer","JP Employer","JHT Employee","JP Employee","Kes Employee","Total Employer","Total Employee"].map(h=><th key={h} style={{...th,textAlign:h==="Month"?"left":"right"}}>{h}</th>)}</tr></thead>
            <tbody>{payroll.map((row,i)=>row&&(
              <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <td style={{padding:"5px 6px",fontSize:12}}>{MN[i]}</td>
                <td style={td}>{fmt(i<2?jpOld:jpNew)}</td>
                <td style={td}>{fmt(row.bpjs.jkkEr)}</td><td style={td}>{fmt(row.bpjs.jkmEr)}</td>
                <td style={td}>{fmt(row.bpjs.kesEr)}</td>
                <td style={{...td,fontWeight:500}}>{fmt(row.erTaxable)}</td>
                <td style={td}>{fmt(row.bpjs.jhtEr)}</td><td style={td}>{fmt(row.bpjs.jpEr)}</td>
                <td style={td}>{fmt(row.bpjs.jhtEmp)}</td><td style={td}>{fmt(row.bpjs.jpEmp)}</td>
                <td style={td}>{fmt(row.bpjs.kesEmp)}</td>
                <td style={{...td,fontWeight:500}}>{fmt(row.bpjs.jhtEr+row.bpjs.jpEr+row.bpjs.jkkEr+row.bpjs.jkmEr+row.bpjs.kesEr)}</td>
                <td style={{...td,fontWeight:500}}>{fmt(row.bpjs.jhtEmp+row.bpjs.jpEmp+row.bpjs.kesEmp)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* ANNUALIZATION */}
      {tab==="annualization"&&(
        <div>
          {!last?.finalData
            ?<p style={{color:"var(--color-text-secondary)",fontSize:13}}>Finalization data appears once payroll is computed.</p>
            :(()=>{
              const fd=last.finalData;
              return(
                <div>
                  <p style={{fontSize:13,fontWeight:500,marginBottom:16}}>
                    Tax annualization — {emp.name||"Employee"} · {emp.ptkp} · TER {terCat} · {MN[startM]}–{MN[endM]} {emp.year}
                    {emp.isExpat&&<span style={{marginLeft:8,background:"var(--color-background-info)",color:"var(--color-text-info)",fontSize:11,padding:"2px 8px",borderRadius:"var(--border-radius-md)"}}>Expat (JP exempt)</span>}
                    {!emp.hasNpwp&&<span style={{marginLeft:8,background:"var(--color-background-danger)",color:"var(--color-text-danger)",fontSize:11,padding:"2px 8px",borderRadius:"var(--border-radius-md)"}}>No NPWP: 20% surcharge</span>}
                  </p>
                  <p style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:8}}>Income reconciliation</p>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:20}}>
                    <tbody>
                      {[
                        {l:"Gross salary (all active months)",v:valid.reduce((s,m)=>s+m.gross,0)},
                        ...(emp.bpjsAllowEnabled?[{l:"Add: BPJS allowance (taxable)",v:valid.reduce((s,m)=>s+m.bpjsAllow,0)}]:[]),
                        {l:"Add: taxable employer BPJS (JKK + JKM + Kes employer)",v:valid.reduce((s,m)=>s+m.erTaxable,0)},
                        {l:"Add: taxable allowances (grossed-up)",v:valid.reduce((s,m)=>s+m.totalTaxableGross,0)},
                        {l:"Add: tax allowances on net allowances",v:valid.reduce((s,m)=>s+m.taFromAllows,0)},
                        {l:"Add: bonuses (grossed-up)",v:valid.reduce((s,m)=>s+m.totalBonusGross,0),note:"per PMK 168/2023"},
                        {l:"Add: tax allowances on net bonuses",v:valid.reduce((s,m)=>s+m.taFromBonuses,0)},
                        {l:"= Total annual taxable gross",v:fd.annGross,bold:true},
                        {l:"Less: Biaya Jabatan (5%, max Rp 6,000,000/year)",v:-fd.bjAnn,indent:true},
                        {l:`Less: PTKP (${emp.ptkp}) ${fmt(fd.ptkpAmt)}/year`,v:-fd.ptkpAmt,indent:true},
                        {l:"= Penghasilan Kena Pajak (PKP)",v:fd.pkpAnn,bold:true},
                      ].map((r,i)=>(
                        <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                          <td style={{padding:"7px 8px",paddingLeft:r.indent?24:8,color:r.bold?"var(--color-text-primary)":"var(--color-text-secondary)",fontWeight:r.bold?500:400}}>
                            {r.l}{r.note&&<span style={{marginLeft:8,fontSize:11,color:"var(--color-text-info)"}}>({r.note})</span>}
                          </td>
                          <td style={{textAlign:"right",padding:"7px 8px",fontWeight:r.bold?500:400,color:r.v<0?"var(--color-text-danger)":"var(--color-text-primary)"}}>
                            {r.v<0?"("+fmt(-r.v)+")":fmt(r.v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:8}}>Pasal 17 progressive tax — PKP = {fmt(fd.pkpAnn)}</p>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:20}}>
                    <thead><tr>{["Income layer","Rate","Tax on layer"].map(h=><th key={h} style={{...th,textAlign:h==="Income layer"?"left":"right"}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {fd.rows.map((b,i)=>(
                        <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                          <td style={{padding:"7px 8px",color:"var(--color-text-secondary)"}}>{fmt(b.from)} – {fmt(b.from+b.chunk)} ({fmt(b.chunk)})</td>
                          <td style={{textAlign:"right",padding:"7px 8px"}}>{(b.rate*100).toFixed(0)}%</td>
                          <td style={{textAlign:"right",padding:"7px 8px",fontWeight:500}}>{fmt(b.tax)}</td>
                        </tr>
                      ))}
                      <tr style={{borderTop:"1px solid var(--color-border-primary)",fontWeight:500}}>
                        <td style={{padding:"7px 8px"}}>Total annual PPh 21 (rounded ↓ Rp 100){!emp.hasNpwp?" × 1.20":""}</td>
                        <td/><td style={{textAlign:"right",padding:"7px 8px"}}>{fmt(fd.annTax)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",marginBottom:8}}>Final settlement</p>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <tbody>
                      {[
                        {l:"Annual PPh 21 (Pasal 17)",v:fd.annTax,bold:true},
                        {l:`Less: tax withheld ${MN[startM]}${endM>startM?"–"+MN[endM-1]:""}`,v:-fd.prior,indent:true},
                        {l:`PPh 21 payable in ${MN[endM]}`,v:Math.max(0,fd.due),bold:true},
                        ...(fd.refund>0?[{l:"Estimated refund",v:fd.refund,green:true,bold:true}]:[]),
                      ].map((r,i)=>(
                        <tr key={i} style={{borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                          <td style={{padding:"7px 8px",paddingLeft:r.indent?24:8,color:r.bold?"var(--color-text-primary)":"var(--color-text-secondary)",fontWeight:r.bold?500:400}}>{r.l}</td>
                          <td style={{textAlign:"right",padding:"7px 8px",fontWeight:r.bold?500:400,color:r.green?"green":r.v<0?"var(--color-text-danger)":"var(--color-text-primary)"}}>
                            {r.v<0?"("+fmt(-r.v)+")":fmt(r.v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
        </div>
      )}

      <div style={{marginTop:20,padding:"8px 12px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",fontSize:11,color:"var(--color-text-secondary)"}}>
        PMK 168/2023 (TER A/B/C) · PMK 101/2016 (PTKP) · PER-16/PJ/2015 (biaya jabatan; JKK + JKM + Kes employer taxable) · PP 44/2015 &amp; PP 46/2015 (BPJS TK) · Perpres 82/2018 (BPJS Kes, cap Rp 12jt) · PP 55/2022 (natura) · JP: Jan–Feb {fmt(jpOld)} / Mar–Dec {fmt(jpNew)}{emp.isExpat?" · JP exempt (expat)":""}
      </div>
    </div>
  );
}

export default function App(){
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem("payroll_authed") === "1"; }
    catch { return false; }
  });

  const handleSuccess = () => {
    try { sessionStorage.setItem("payroll_authed", "1"); } catch {}
    setAuthed(true);
  };
  const handleSignOut = () => {
    try { sessionStorage.removeItem("payroll_authed"); } catch {}
    setAuthed(false);
  };

  if (!authed) return <Login onSuccess={handleSuccess} />;
  return <PayrollCalculator onSignOut={handleSignOut} />;
}
