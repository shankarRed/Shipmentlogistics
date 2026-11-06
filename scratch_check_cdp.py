import urllib.request, json
import asyncio

async def test():
    import websockets
    req = urllib.request.urlopen('http://localhost:9222/json')
    pages = json.loads(req.read())
    target = [p for p in pages if 'localhost:8080' in p.get('url', '')][0]
    ws_url = target['webSocketDebuggerUrl']
    async with websockets.connect(ws_url) as ws:
        expr = """
        ({
            carriersSeed: typeof window.CARRIERS_500_SEED !== 'undefined' ? window.CARRIERS_500_SEED.length : null,
            storeCarriers: window.BRIDGES_STORE ? window.BRIDGES_STORE.getCarriers().length : null,
            mapLoaded: typeof window.LiveTrackingMap !== 'undefined',
            mapCarriers: window.LiveTrackingMap ? window.LiveTrackingMap.carriers.length : null,
            currentView: window.App ? window.App.currentView : null
        })
        """
        msg = {'id': 1, 'method': 'Runtime.evaluate', 'params': {'expression': expr, 'returnByValue': True}}
        await ws.send(json.dumps(msg))
        res = await ws.recv()
        print('Evaluation result:', res)

asyncio.run(test())
