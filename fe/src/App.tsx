import { ConfigProvider, App as AntDApp, Layout } from "antd";

import classes from "./App.module.css";
import Home from "./pages/Home";

function App() {
  return (
    <ConfigProvider theme={{ cssVar: true }}>
      <AntDApp className={classes.app}>
        <Layout>
          <Layout.Header>
            <h1 className={classes.title}>Image inference viewer</h1>
          </Layout.Header>
          <Layout.Content className={classes.content}>
            <Home />
          </Layout.Content>
        </Layout>
      </AntDApp>
    </ConfigProvider>
  );
}

export default App;
