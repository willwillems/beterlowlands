<style>
.lightbox {
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  z-index: 99;
}

.artist-modal {
  position: fixed;
  top: 40px;
  right: 40px;
  bottom: 40px;
  left: 40px;
  background-color: white;
  border: 2px solid black;
  z-index: 100;
}
.artist-modal__content {
  font-size: 12px;
  line-height: 22px;
  padding: 10px 10px !important;
}

.artist-modal__bar {
  height: 30px;
  text-align: center;
  border-bottom: 2px solid black;
  overflow: hidden;
}

.artist-modal__bar > div {
  height: 28px;
  width: 100%;
  background: #ffffff;
  background: linear-gradient(to bottom,  #ffffff 0%,#ffffff 50%,#000000 51%,#000000 100%);
  background-size: 4px 4px;
  position: absolute;
}

.artist-modal__bar > div b {
  height: 14px;
  background: white;
  padding: 0 2px;
  line-height: 14px;
  display: inline-block;
  font-size: 12px;
}

.artist-modal__bar > button {
  height: 18px;
  width: 18px;
  background: #ffffff;
  border: 2px solid black;
  position: absolute;
  top: 3px;
  left: 3px;
  z-index: 3;
  margin: 2px 14px;
  display: block;
  box-shadow: 0 0 0 2px white;
}
</style>

<div class="lightbox" on:click="{() => artist = null}"></div>
<div class="artist-modal">
  <div class="artist-modal__bar">
    <button on:click="{() => artist = null}"></button>
    <div><b>Artist viewer</b></div>
  </div>
  <div class="artist-modal__content">
    <img src="https://graph.facebook.com/{(artist.socialLinkFacebook || '').split('/')[3]}/picture?type=square" alt="artist image"/>
    <h1>{ artist.title }</h1>
    {#if artist.style }<b>{ artist.style }</b>{/if}
    <p>{artist.description.replace(/<[^>]*>?/gm, '')}</p>
    <div>
      {#if artist.socialLinkFacebook }<a href="{artist.socialLinkFacebook}">FB</a>{/if}
      {#if artist.socialLinkTwitter }<a href="{artist.socialLinkTwitter}">TW</a>{/if}
      {#if artist.socialLinkInstagram }<a href="{artist.socialLinkInstagram}">IG</a>{/if}
    </div>
  </div>
</div>

<script>
  export let artist;
</script>