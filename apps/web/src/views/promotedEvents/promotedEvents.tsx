import { clsx } from "clsx";
import Card from "components/cardExpanded/cardExpanded";
import globals from "styles/globals.module.scss";
import styles from "./promotedEvents.module.scss";

export default function PromotedEvents() {
  const propEvents = [
    {
      title: "Fencing Croatia Open",
      participants: 893218,
      viewers: 213,
      image:
        "https://plus.unsplash.com/premium_photo-1661876708169-5656991eb206?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmVuY2luZ3xlbnwwfHwwfHx8MA%3D%3D",
    },
    {
      title: "National Football Championship",
      participants: 3589323588,
      viewers: 213,
      image:
        "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZvb3RiYWxsfGVufDB8fDB8fHww",
    },
    {
      title: "Formula One World Championship",
      participants: 583211,
      viewers: 3263113,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/1985_European_GP_Stefan_Johansson_01.jpg/1920px-1985_European_GP_Stefan_Johansson_01.jpg",
    },
    {
      title: "FIBA Basketball World Cup",
      participants: 385315,
      viewers: 21331321,
      image:
        "https://imageio.forbes.com/specials-images/imageserve/64fda5331989d006addcb9a5/USA-v-Canada--3rd-Place-Game---FIBA-Basketball-World-Cup/960x0.jpg?format=jpg&width=960",
    },
    {
      title: "UCI Mountain Bike Marathon World Championships",
      participants: 3121231231,
      viewers: 242314313,
      image:
        "https://images.ctfassets.net/761l7gh5x5an/4jZPbbS3Gt0Cd4euiN8Lf7/aae4f9bc18cc27485e78de7de4874789/MC_Snowshoe-XCM_013.JPG?fit=thumb&fl=progressive&w=400&h=",
    },
    {
      title: "World Table Tennis Championships",
      participants: 642323,
      viewers: 64213124,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/2009_THE_WORLD_TABLE_TENNIS_CHAMPIONSHIPS_%283670515016%29.jpg/250px-2009_THE_WORLD_TABLE_TENNIS_CHAMPIONSHIPS_%283670515016%29.jpg",
    },
    {
      title: "FIVB Volleyball Men's World Championships",
      participants: 5631623,
      viewers: 6313,
      image: "https://media.koobit.com/2018-final-31180.jpg",
    },
    {
      title: "World Archery Championships",
      participants: 43135,
      viewers: 649213,
      image:
        "https://www.worldarchery.sport/sites/default/files/styles/style_teaser/https/photos.smugmug.com/photos/i-HFmbnGC/0/X5/i-HFmbnGC-X5.jpg?h=2dcc2c0c&itok=qx4LnO9c",
    },
  ];
  return (
    <div className={styles.wrapper}>
      <h1 className={clsx(globals.largeText, styles.header)}>
        promoted events
      </h1>
      <div className={clsx(styles.events)}>
        {propEvents.map((event, index) => (
          <Card
            key={index}
            participants={event.participants}
            label={event.title}
            image={event.image}
            viewers={event.viewers}
            variant="dark"
          />
        ))}
      </div>
    </div>
  );
}
