import { Modal } from './Room'

/** The case study behind the game, using photos from the team's deck. */
export function Behind({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Behind the design" onClose={onClose} wide>
      <div className="case">
        <div className="facts">
          <div>
            <b>Role</b>Needfinding, experience design, prototyping, user testing
          </div>
          <div>
            <b>Context</b>Team project · StartX and Stanford Research Park · 2025
          </div>
          <div>
            <b>Outcome</b>A tested room concept and scream kit informed by founder feedback
          </div>
        </div>

        <h4>The need</h4>
        <p>
          We toured StartX to understand how to design an innovation hub for the next generation of founders at Stanford Research Park, then focused on
          early-stage <b>solo founders</b> and interviewed six people in the StartX community.
        </p>
        <p className="pov">
          Founders need a <b>private, judgment-free</b> way to release emotional tension, because they make every decision alone and face unspoken pressure to
          appear confident. What they need is <b>not advice, but a space</b> where they can let their guard down without performing.
        </p>

        <h4>Three prototypes, three motivations</h4>
        <div className="protos">
          <figure>
            <img src="/photos/box.jpg" alt="The Box prototype at the trade show" />
            <figcaption>
              <span className="tagb lime">Box</span> @ Tradeshow
            </figcaption>
          </figure>
          <figure>
            <img src="/photos/room.jpg" alt="The Room prototype installed at StartX" />
            <figcaption>
              <span className="tagb gold">Room</span> @ StartX
            </figcaption>
          </figure>
          <figure>
            <img src="/photos/booth.jpg" alt="The Booth prototype in the d.school atrium" />
            <figcaption>
              <span className="tagb coral">Booth</span> @ d.school atrium
            </figcaption>
          </figure>
        </div>
        <ul className="map-list">
          <li>
            <b>Storefront signage</b> (“I scream, you scream, we all scream”) → the sign that greets you in the lobby.
          </li>
          <li>
            <b>Situational nudging</b>: objects whose form suggests screaming → the “SCREAM HERE” floor decal and arrow.
          </li>
          <li>
            <b>Sensory overload</b>: humorously heightening stress to elicit a first scream → the notifications that pile up before you go in.
          </li>
        </ul>

        <h4>What founders told us, and what changed</h4>
        <div className="insights">
          <div className="ins gold">
            <span>Privacy</span>“I don’t feel safe enough to scream”
            <b>→ Soundproof + occupied lock</b>
          </div>
          <div className="ins coral">
            <span>Vibe</span>“The box is very Halloween-y, it is all black”
            <b>→ A mix of color</b>
          </div>
          <div className="ins lime">
            <span>Functionality</span>“What else can we do in the room?”
            <b>→ Complementary activities</b>
          </div>
        </div>

        <h4>Golden moments</h4>
        <div className="moments">
          <figure>
            <img src="/photos/moment1.jpg" alt="A founder with a balloon in the room" />
            <figcaption>“I didn’t realize how much I needed to scream until I actually did it.”</figcaption>
          </figure>
          <figure>
            <img src="/photos/moment2.jpg" alt="Founders reading sticky notes" />
            <figcaption>“Reading other people’s sticky notes reminded me I’m not the only one struggling.”</figcaption>
          </figure>
          <figure>
            <img src="/photos/moment3.jpg" alt="Two founders smiling in the room" />
            <figcaption>“I thought it was just a gimmick, but it actually worked. I felt more grounded afterwards.”</figcaption>
          </figure>
        </div>

        <h4>The final room</h4>
        <div className="final">
          <img src="/photos/final.jpg" alt="The final soundproof room full of balloons, soccer balls and sticky notes" />
          <p>
            A soundproof room with a <b>scream kit</b>: anonymous sticky notes for sharing stress, balloons for sensory play, and soccer balls for kicking. It’s
            deliberately whimsical, even a little gimmicky, to draw people in, but it’s really a place to escape digital monotony and exhaustion.
          </p>
          <p className="muted">
            This game swaps the tested blue moving blankets for newer acoustic treatments (a wooden quadratic-residue diffuser, recycled-PET felt fins, 3D wave panels and acoustic clouds) in Stanford Research Park colors. Tap the neon sign in the room to compare with the original.
          </p>
        </div>
      </div>
    </Modal>
  )
}
