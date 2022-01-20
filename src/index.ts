import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from 'fortmatic';
import Portis from '@portis/web3';
import Web3 from 'web3';
import Torus from "@toruslabs/torus-embed";
import Authereum from 'authereum';

// walletAddressProvider is designed to collect a stateful list of user 
// owned addressess from multiple networks.

const networks = {
    1: {
        chainName: "Ethereum",
    },
    3: {
        chainName: "Ropsten",
    },
    4: {
        chainName: "Rinkeby",
    },
    5: {
        chainName: "Goerli",
    },
    42: {
        chainName: "Kovan",
    },
    85: {
        chainName: "Polygon",
    },
    80001: {
        chainName: "Mumbai",
    },
}

const walletAddressProvider = {

    // @ts-ignore
    state: { addresses: [ /* { address, chainName, networkId } */ ] },

    // @ts-ignore
    registeredWalletProviders: {},

    // Event hook of new addresses added to the module
    onUpdate() {

        return this.state;

    },

    connect ( walletType: string) {

        this[walletType]();

    },

    registerNewWalletProvider ( walletType: any, walletProvierInstance:any ) {

        this.registeredWalletProviders[walletType] = { instance: walletProvierInstance };

    },
    
    unRegisterWalletProvider ( walletType: any ) {

        delete this.registeredWalletProviders[walletType];

    },

    registerNewWalletAddress ( address:string, chainId:string ) {

        // @ts-ignore
        const chainName = networks[chainId].chainName;
        
        this.state.addresses.push({ address, chainName, chainId });

        this.onUpdate();

    },

    async getWeb3ChainId ( web3: any) {

        // @ts-ignore
        return web3.eth.getChainId();

    },

    async getWeb3Accounts( web3: any ) {

        // @ts-ignore
        return web3.eth.getAccounts();

    },

    async getWeb3ChainIdAndAccounts( web3: any ) {

        const chainId = await this.getWeb3ChainId( web3 );
        
        const accounts = await this.getWeb3Accounts( web3 );

        return { chainId, accounts };

    },

    async MetaMask () {

        console.log('connect MetaMask');
      
        // @ts-ignore
        if (typeof window.ethereum !== 'undefined') {
            
            // @ts-ignore
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            
            // @ts-ignore
            const hexChainId = await ethereum.request({ method: 'eth_chainId' });

            const accountAddress = accounts[0];

            this.registerNewWalletAddress(accountAddress, parseInt(hexChainId, 16));

        }
        
    },

    async WalletConnect () {

        console.log('connect Wallet Connect');

        //  Create WalletConnect Provider
        this.provider = new WalletConnectProvider({
            infuraId: "7753fa7b79d2469f97c156780fce37ac",
        });
        
        // Subscribe to accounts change
        this.provider.on("accountsChanged", (accounts: string[]) => {

            console.log(accounts);

            if (this.WalletConnectChainId) {

                this.registerNewWalletAddress(accounts[0], this.WalletConnectChainId);
                
            }

        });
            
        // Subscribe to chainId change
        this.provider.on("chainChanged", (chainId: number) => {

            console.log(chainId);

            this.WalletConnectChainId = chainId;

        });
        
        // Subscribe to session disconnection
        this.provider.on("disconnect", (code: number, reason: string) => {

            console.log(code, reason);

            this.unRegisterWalletProvider("WalletConnect");

        });
        
        //  Enable session (triggers QR Code modal)
        this.provider.enable();

        // register reference to provider
        this.registerNewWalletProvider( "WalletConnect", this.provider );

    },

    async Fortmatic () {

        console.log('connect Fortmatic');

        // https://replit.com/@fortmatic/demo-kitchen-sink

        const fm = new Fortmatic('pk_test_96DF5BB9127A2C79');
        
        // @ts-ignore
        const web3 = new Web3(fm.getProvider());

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        this.registerNewWalletAddress(accounts[0], chainId);

        this.registerNewWalletProvider( "Fortmatic", web3 );

    },

    async Torus () {

        console.log('connect Torus');

        const torus = new Torus();
        
        await torus.init();

        await torus.login();
        
        // @ts-ignore
        const web3 = new Web3(torus.provider);

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        this.registerNewWalletAddress(accounts[0], chainId);

        this.registerNewWalletProvider( "Fortmatic", web3 );

    },

    async Portis () {

        console.log('connect Portis');

        // https://docs.portis.io/#/methods

        const portis = new Portis("211b48db-e8cc-4b68-82ad-bf781727ea9e", "rinkeby");

        portis.onError(error => { console.log('portis error', error) });

        const web3 = new Web3(portis.provider);

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        this.registerNewWalletAddress(accounts[0], chainId);

        this.registerNewWalletProvider( "Fortmatic", web3 );

    },

    async Authereum  () {

        console.log('connect Authereum');

        const authereum = new Authereum('kovan');

        const provider = authereum.getProvider();

        const web3 = new Web3(provider);

        await provider.enable();

        // register reference to provider
        this.registerNewWalletProvider( "Authereum", this.provider );

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        this.registerNewWalletAddress(accounts[0], chainId);

    },

}

// walletAddressProvider.connect('WalletConnect');
// walletAddressProvider.connect('Fortmatic');
// walletAddressProvider.connect('Portis');
// walletAddressProvider.connect('Torus');
// walletAddressProvider.connect('Authereum');
// walletAddressProvider.connect('MetaMask');
