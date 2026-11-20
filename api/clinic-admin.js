/* Loaded by the authenticated PHP workspace. Patient and editor input is rendered as text. */
const clinicWorkspace = (() => {
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
  const get = (action, args = {}) => fetchJson(`${apiBase}?${new URLSearchParams({ action, ...args })}`, { cache: 'no-store' });
  const post = (action, body) => fetchJson(`${apiBase}?action=${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const btn = (label, fn, danger = false) => {
    const b = el('button', label, 'button button-sm ' + (danger ? 'button-danger' : 'button-secondary')); b.type = 'button';
    b.onclick = async () => { b.disabled = true; try { await fn(); } catch (e) { toast(e.message, 'err'); } finally { b.disabled = false; } }; return b;
  };
  function input(parent, name, title, value, type = 'text') {
    const label = el('label', title); const field = el(type === 'textarea' ? 'textarea' : 'input', null, 'input');
    if (type !== 'textarea') field.type = type; else field.rows = 3;
    field.name = name; field.value = value ?? ''; field.required = true; label.append(field); parent.append(label); return field;
  }
  const sets = { bookings: 'bookings', comments: 'comments', messages: 'messages', forum: 'posts' };
  const cache = {}, versions = {};
  const result = (key, text) => { byId(key + '-result').textContent = text; };
  async function mutate(key, action, body, message) { await post(action, body); await load(key); result(key, message); }
  function recordList(key) {
    const dest = byId(key + '-records'); dest.replaceChildren();
    const term = byId(key + '-filter').value.trim().toLocaleLowerCase();
    const rows = (cache[key] || []).filter(r => Object.values(r).join(' ').toLocaleLowerCase().includes(term));
    if (!rows.length) dest.append(el('p', term ? 'No matching records.' : 'No records yet.', 'muted'));
    for (const r of rows) {
      const item = el('details', null, 'clinic-record'); const summary = el('summary'); const title = r.title || r.full_name || r.subject || r.post_title || 'Comment';
      summary.append(el('strong',title), el('small', key === 'bookings' ? `${r.preferred_date} · ${r.preferred_time} · ${r.status}` : key === 'comments' ? `${r.author_name} · ${Number(r.is_approved) ? 'Approved' : 'Pending'}` : `${r.name || r.author_name} · ${r.created_at}`, 'muted'));
      item.append(summary); const body = el('div',null,'clinic-fields'); item.append(body); dest.append(item);
      if (key === 'bookings') {
        body.append(el('p',`${r.session_type} · ${r.email} · ${r.phone}`), el('p',r.notes || 'No appointment notes.'));
        const label = el('label','Reservation status'); const select = el('select',null,'input');
        for(const s of ['pending','confirmed','completed','cancelled']) select.add(new Option(s,s,false,s===r.status)); label.append(select); body.append(label);
        if(r.status!=='cancelled') body.append(btn('Save status', async()=> { if(select.value==='cancelled' && !confirm('Cancel this reservation and release its slot?')) return; await mutate(key,'booking-status',{id:r.id,status:select.value},'Status saved.'); })); else select.disabled=true;
      } else if (key === 'comments') {
        body.append(el('p',r.content), btn(Number(r.is_approved)?'Unpublish':'Approve',()=>mutate(key,'moderate-comment',{id:r.id,approved:Number(r.is_approved)?0:1},'Moderation saved.')));
      } else if (key === 'messages') {
        body.append(el('p',r.email),el('p',r.message));
        const reply = el('a','Reply by email','button button-secondary button-sm'); reply.href='mailto:'+encodeURIComponent(r.email)+'?subject='+encodeURIComponent('Re: '+r.subject); body.append(reply);
      } else {
        body.append(el('p',r.content), btn(`Manage topic and replies (${r.reply_count})`,()=>topicEditor(dest,r.id)));
      }
      body.append(btn('Delete',async()=>{ if(confirm('Permanently delete this record?')) await mutate(key,'delete-'+({bookings:'booking',comments:'comment',messages:'message',forum:'forum'})[key],{id:r.id},'Deleted.'); },true));
    }
  }
  async function topicEditor(host, id) {
    const thread = id ? await get('thread',{id}) : {post:{},replies:[]}; const p=thread.post;
    const form=el('form',null,'clinic-fields'); host.replaceChildren(form); form.append(el('h2',id?'Edit topic':'New topic'));
    input(form,'title','Title',p.title); input(form,'author_name','Author',p.author_name); input(form,'content','Question',p.content,'textarea');
    const label=el('label','Category'), select=el('select',null,'input'); select.name='category';
    for(const c of ['general','treatment','support','other'])select.add(new Option(c,c,false,c===p.category)); label.append(select);form.append(label);
    form.append(el('button','Save topic','button button-primary'),btn('Back to list',()=>load('forum')));
    form.onsubmit=async e=>{e.preventDefault();await withForm(form,'forum',()=>mutate('forum','save-topic',{...Object.fromEntries(new FormData(form)),id},'Topic saved.'));};
    if(!id)return;
    host.append(el('h2','Replies')); for(const r of thread.replies){const item=el('div',null,'clinic-record'); item.append(el('strong',r.author_name),el('p',r.content),btn('Delete reply',async()=>{if(confirm('Delete this reply?')){await post('delete-reply',{id:r.id});await topicEditor(host,id);}},true));host.append(item);}
    const reply=el('form',null,'clinic-fields'); input(reply,'author_name','Staff name','');input(reply,'content','Staff reply','','textarea');reply.append(el('button','Post staff reply','button button-primary'));host.append(reply);
    reply.onsubmit=async e=>{e.preventDefault();await withForm(reply,'forum',async()=>{await post('staff-reply',{...Object.fromEntries(new FormData(reply)),id});await topicEditor(host,id);result('forum','Reply published.');});};
  }
  async function withForm(form,key,fn){const submit=form.querySelector('button:not([type="button"])');if(submit.disabled)return;submit.disabled=true;try{await fn();}catch(e){result(key,e.message);}finally{submit.disabled=false;}}
  const weekday=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function showSchedule(data) {
    const fields=byId('schedule-fields'); fields.replaceChildren(); fields.className='clinic-fields';
    const s=data.settings; input(fields,'first_available_date','First available date',s.first_available_date,'date');
    for(const [k,label,max,min] of [['booking_window_days','Booking window (days)',365,1],['slot_duration_minutes','Appointment length (minutes)',240,10]]){const n=input(fields,k,label,s[k],'number');n.min=min;n.max=max;}
    fields.append(el('p',`Weekly availability · ${data.policy.timeZone} · ${data.policy.opens}–${data.policy.closes}. You may narrow these hours or disable a day.`, 'muted'));
    const week=data.policy.weekdays.map(d=>{const r=data.week.find(row=>row.day_of_week===d);const box=el('fieldset',null,'clinic-week');box.append(el('legend',weekday[d]));fields.append(box);
      const label=el('label','Accept bookings '), enabled=el('input');enabled.type='checkbox';enabled.checked=!!r?.is_available;label.append(enabled);box.append(label);
      const start=input(box,'start_'+d,'Opens',r?.start_time??data.policy.opens,'time'), end=input(box,'end_'+d,'Closes',r?.end_time??data.policy.closes,'time');
      [start,end].forEach(n=>{n.min=data.policy.opens;n.max=data.policy.closes;n.disabled=!enabled.checked;});enabled.onchange=()=>{start.disabled=end.disabled=!enabled.checked;};
      return ()=>({day_of_week:d,is_available:enabled.checked?1:0,start_time:start.value,end_time:end.value});});
    const form=byId('schedule-form'); byId('schedule-save').disabled=false;
    form.onsubmit=async e=>{e.preventDefault();await withForm(form,'schedule',()=>mutate('schedule','save-schedule',{first_available_date:form.elements.first_available_date.value,booking_window_days:+form.elements.booking_window_days.value,slot_duration_minutes:+form.elements.slot_duration_minutes.value,week:week.map(read=>read())},'Booking availability saved.'));};
    const blocks=byId('schedule-blocks');blocks.replaceChildren();if(!data.blocks.length)blocks.append(el('p','No blocked starts.','muted'));
    for(const r of data.blocks){const line=el('div',null,'clinic-record');line.append(el('span',`${r.date} · ${r.time.slice(0,5)} ${r.reason||''} `),btn('Unblock',()=>mutate('schedule','unblock-slot',{id:r.id},'Slot unblocked.')));blocks.append(line);}
  }
  const labelOf=k=>({eyebrow:'Section label',consultationNote:'Consultation note',hours:'Time range',zone:'Time zone caption',codes:'Abbreviations (one per line)',sites:'Body sites (one per line)'})[k]||k.charAt(0).toUpperCase()+k.slice(1);
  function editFields(parent,obj,locale){
    for(const [k,v] of Object.entries(obj)) {
      if(k==='id')continue;
      if(typeof v==='string'||(Array.isArray(v)&&typeof v[0]==='string')) {
        const list=Array.isArray(v);const e=input(parent,k,labelOf(k),list?v.join('\n'):v,list||['introduction','description','consultationNote'].includes(k)?'textarea':'text');e.dir=locale==='fa'?'rtl':'ltr';if(k==='hours'||k==='codes')e.dir='ltr';e.maxLength=list?2500:2000;
        e.oninput=()=>{obj[k]=list?e.value.split('\n').map(t=>t.trim()).filter(Boolean):e.value;};
      } else if(Array.isArray(v)) {
        v.forEach((entry,index)=>{const group=el('fieldset',null,'clinic-fields');group.append(el('legend',`${labelOf(k)} · ${index+1}`));parent.append(group);editFields(group,entry,locale);});
      }
    }
  }
  function showCopy(data){const loc=byId('copy-language').value,section=byId('copy-section').value;
    byId('copy-note').textContent=section==='hours'?'Display text only. Publishing here never changes bookable days or times.':'Plain text only. Stable treatment anchors and the existing hierarchy are preserved.';
    const fields=byId('copy-fields');fields.replaceChildren();fields.className='clinic-fields';const value=data.copy[section];editFields(fields,value,loc);byId('copy-publish').disabled=false;
    let revision=data.revisions[section]||0;const form=byId('copy-form');form.onsubmit=async e=>{e.preventDefault();await withForm(form,'copy',async()=>{const saved=await post('publish-copy',{locale:loc,section,value,revision});revision=saved.revision;result('copy','Published. Refresh the public page to see the changes.');});};
  }
  async function load(key){const ver=versions[key]=(versions[key]||0)+1;result(key,'Loading…');
    if(key==='copy'){byId('copy-publish').disabled=true;byId('copy-fields').replaceChildren();}if(key==='schedule')byId('schedule-save').disabled=true;
    try{const data=await get(key==='copy'?'clinic-copy':key,key==='copy'?{locale:byId('copy-language').value}:{});if(versions[key]!==ver)return;
      if(key==='copy')showCopy(data);else if(key==='schedule')showSchedule(data);else{cache[key]=data[sets[key]];recordList(key);}result(key,'');
    }catch(e){if(versions[key]===ver)result(key,e.message);}
  }
  for(const k of Object.keys(sets))byId(k+'-filter').oninput=()=>recordList(k);
  byId('new-topic').onclick=()=>topicEditor(byId('forum-records'),0);
  byId('copy-language').onchange=byId('copy-section').onchange=()=>load('copy');
  const block=byId('block-form');block.onsubmit=async e=>{e.preventDefault();await withForm(block,'schedule',async()=>{await mutate('schedule','block-slot',Object.fromEntries(new FormData(block)),'Slot blocked.');block.reset();});};
  return {load};
})();