import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from 'fortmatic';
import Portis from '@portis/web3';
import Web3 from 'web3';
import { ethers } from "ethers";
import Torus from "@toruslabs/torus-embed";
import Authereum from 'authereum';

// walletAddressProvider is designed to collect a stateful list of user 
// owned addressess from multiple networks.

class Web3WalletProvider {

    state: any;
    registeredWalletProviders:any;
    networks: any;

    constructor() {

        this.networks = {
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

        // @ts-ignore
        this.state = { addresses: [ /* { address, chainName, chainId, provider } */ ] };

        // @ts-ignore
        this.registeredWalletProviders = {};
        
    }

    connectWith ( walletType: string ) {

        if(!walletType) throw new Error('Please provide a Wallet type to connect with.');

        // @ts-ignore
        if(this[walletType]) this[walletType]();
        else throw new Error('Wallet type not found');

    };

    async signWith ( message: string, walletData: any ) {

        // @ts-ignore
        let provider = new ethers.providers.Web3Provider(walletData.provider);
  
        let signer = provider.getSigner();
  
        return await signer.signMessage(message);

    }

    getConnectedWalletData () {

        return this.state.addresses;

    }

    registerNewWalletAddress ( address:string, chainId:string, provider:any ) {

        // @ts-ignore
        const chainName = this.networks[chainId].chainName;
        
        this.state.addresses.push({ address, chainName, chainId, provider });

        return this.state.addresses;

    };

    async getWeb3ChainId ( web3: any) {

        // @ts-ignore
        return web3.eth.getChainId();

    };

    async getWeb3Accounts( web3: any ) {

        // @ts-ignore
        return web3.eth.getAccounts();

    };

    async getWeb3ChainIdAndAccounts( web3: any ) {

        const chainId = await this.getWeb3ChainId( web3 );
        
        const accounts = await this.getWeb3Accounts( web3 );

        return { chainId, accounts };

    };

    async MetaMask () {

        console.log('connect MetaMask');
      
        // @ts-ignore
        if (typeof window.ethereum !== 'undefined') {

            //@ts-ignore
            // await ethereum.enable(); // fall back may be needed for FF to open Extension Prompt.
            
            // @ts-ignore
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            
            // @ts-ignore
            const hexChainId = await ethereum.request({ method: 'eth_chainId' });

            const accountAddress = accounts[0];

            // @ts-ignore
            const registeredWalletAddress = this.registerNewWalletAddress(accountAddress, parseInt(hexChainId, 16), ethereum);

            return registeredWalletAddress;

        } else {

            throw new Error("MetaMask is not available. Please check the extension is supported and active.");

        }
        
    };

    async WalletConnect () {

        console.log('connect Wallet Connect');

        //  Create WalletConnect Provider
        const walletConnectProvider = new WalletConnectProvider({
            infuraId: "7753fa7b79d2469f97c156780fce37ac",
        });
        
        // Subscribe to accounts change
        walletConnectProvider.on("accountsChanged", (accounts: string[]) => {

            console.log(accounts);

            const registeredWalletAddress = this.registerNewWalletAddress(accounts[0], '1', walletConnectProvider);

            return registeredWalletAddress;
                
        });
            
        // Subscribe to chainId change
        walletConnectProvider.on("chainChanged", (chainId: number) => {

            console.log(chainId);

        });
        
        // Subscribe to session disconnection
        walletConnectProvider.on("disconnect", (code: number, reason: string) => {

            console.log(code, reason);

        });
        
        //  Enable session (triggers QR Code modal)
        walletConnectProvider.enable();

    };

    async Fortmatic () {

        console.log('connect Fortmatic');

        // https://replit.com/@fortmatic/demo-kitchen-sink

        // const fm = new Fortmatic('pk_test_96DF5BB9127A2C79');

        const fm = new Fortmatic('pk_live_7F5E8827DC55A364');
        
        const fortmaticProvider = fm.getProvider();

        // @ts-ignore
        const web3 = new Web3(fortmaticProvider);

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        const registeredWalletAddress = this.registerNewWalletAddress(accounts[0], chainId, fortmaticProvider);

        return registeredWalletAddress;

    };

    async Torus () {

        console.log('connect Torus');

        const torus = new Torus();
        
        await torus.init();

        await torus.login();
        
        // @ts-ignore
        const web3 = new Web3(torus.provider);

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        const registeredWalletAddress = this.registerNewWalletAddress(accounts[0], chainId, torus.provider);

        return registeredWalletAddress;

    };

    async Portis () {

        console.log('connect Portis');

        // https://docs.portis.io/#/methods

        const portis = new Portis("211b48db-e8cc-4b68-82ad-bf781727ea9e", "rinkeby");

        portis.onError(error => { console.log('portis error', error) });

        const web3 = new Web3(portis.provider);

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        const registeredWalletAddress = this.registerNewWalletAddress(accounts[0], chainId, portis.provider);

        return registeredWalletAddress;
        
    };

    async Authereum  () {

        console.log('connect Authereum');

        const authereum = new Authereum('kovan');

        const authereumProvider = authereum.getProvider();

        const web3 = new Web3(authereumProvider);

        await authereumProvider.enable();

        const { accounts, chainId } = await this.getWeb3ChainIdAndAccounts( web3 );

        const registeredWalletAddress = this.registerNewWalletAddress(accounts[0], chainId, authereumProvider);

        return registeredWalletAddress;

    };

}

export default Web3WalletProvider;

//@ts-ignore
// window.web3WalletProvider = new Web3WalletProvider();
// @ts-ignore
// window.web3WalletProvider.connectWith('WalletConnect');
// @ts-ignore
// window.web3WalletProvider.signWith("msg", window.web3WalletProvider.getConnectedWalletData()[0]);

// examples for each type
// walletAddressProvider.connectWith('WalletConnect');
// walletAddressProvider.connectWith('Fortmatic'); (works)
// walletAddressProvider.connectWith('Portis'); (works)
// walletAddressProvider.connectWith('Torus'); (works)
// walletAddressProvider.connectWith('Authereum');
// walletAddressProvider.connectWith('MetaMask'); (works)