import Project from "./project";
import { useRouter } from "next/router";

function Home({ changeTheme, ...props }) {
  const router = useRouter();
  const activePath = router.asPath;
  if (activePath.includes("/project")) {
    return <Project props={props} changeTheme={changeTheme} />;
  } else {
    return <Project props={props} changeTheme={changeTheme} />;
  }
}

export default Home;
