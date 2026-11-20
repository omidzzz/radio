<section class="utility-view" id="copy-view" hidden>
  <div class="utility-heading"><div><h1>Public site content</h1><p>Edit the text patients see. Publish each language and section separately.</p></div></div>
  <div class="utility-panel"><div class="workspace-actions">
    <label>Language<select id="copy-language" class="input"><option value="fa">فارسی</option><option value="en">English</option></select></label>
    <label>Section<select id="copy-section" class="input"><option value="atlas">Treatment atlas</option><option value="journey">Treatment journey</option><option value="hours">Office-hours display</option></select></label>
  </div><p class="muted" id="copy-note"></p><form id="copy-form"><div id="copy-fields"></div><button class="button button-primary" id="copy-publish" disabled>Publish changes</button></form><p role="status" id="copy-result"></p></div>
</section>
<section class="utility-view" id="schedule-view" hidden>
  <div class="utility-heading"><div><h1>Booking availability</h1><p>These settings affect real appointments. Display copy is managed separately.</p></div></div>
  <div class="utility-panel"><form id="schedule-form"><div id="schedule-fields"></div><button class="button button-primary" id="schedule-save" disabled>Save booking availability</button></form></div>
  <div class="utility-panel"><h2>Blocked appointment starts</h2><div id="schedule-blocks"></div>
    <form class="workspace-actions" id="block-form"><label>Date<input required type="date" class="input" name="date"></label><label>Start (Tehran)<input required type="time" class="input" name="time"></label><label>Reason (optional)<input class="input" name="reason" maxlength="255"></label><button class="button button-secondary">Block slot</button></form>
  </div><p role="status" id="schedule-result"></p>
</section>