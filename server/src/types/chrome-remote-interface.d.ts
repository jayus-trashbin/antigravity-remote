declare module 'chrome-remote-interface' {
  namespace CDP {
    interface Client {
      Runtime: any;
      DOM: any;
      Page: any;
      [key: string]: any;
    }

    interface Target {
      id: string;
      title: string;
      url: string;
      type: string;
    }

    function List(options?: any): Promise<Target[]>;
    function New(options?: any): Promise<any>;
    function Connect(options?: any): Promise<Client>;
  }

  function CDP(options?: any): Promise<CDP.Client>;
  export = CDP;
}
