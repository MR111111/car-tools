<script lang="ts">
  let distance = $state(1000);
  let gasFuelEfficiency = $state(15);
  let gasPrice = $state(170);
  let evEfficiency = $state(6.0);
  let homeChargePrice = $state(30);
  let quickChargePrice = $state(55);
  let homeChargeRatio = $state(80);
  let priceDiff = $state(0);
  let years = $state(10);

  const quickChargeRatio = $derived(100 - homeChargeRatio);
  const gasMonthlyCost = $derived((distance / gasFuelEfficiency) * gasPrice);
  const gasYearlyCost = $derived(gasMonthlyCost * 12);
  const homeKwh = $derived(distance / evEfficiency * (homeChargeRatio / 100));
  const quickKwh = $derived(distance / evEfficiency * (quickChargeRatio / 100));
  const quickKwhPrice = $derived(quickChargePrice * 2);
  const evMonthlyCost = $derived(homeKwh * homeChargePrice + quickKwh * quickKwhPrice);
  const evYearlyCost = $derived(evMonthlyCost * 12);
  const monthlyDiff = $derived(gasMonthlyCost - evMonthlyCost);
  const yearlyDiff = $derived(monthlyDiff * 12);
  const totalDiff10y = $derived(yearlyDiff * years - priceDiff * 10000);
  const breakEvenMonths = $derived(
    monthlyDiff > 0 && priceDiff > 0
      ? Math.ceil((priceDiff * 10000) / monthlyDiff)
      : null
  );

  function fmt(n: number) {
    return Math.round(n).toLocaleString('ja-JP');
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        月間走行距離：<span class="text-sky-600 font-bold">{distance.toLocaleString()} km</span>
      </label>
      <input type="range" min="300" max="3000" step="100" bind:value={distance} class="w-full accent-sky-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        ガソリン車の燃費：<span class="text-sky-600 font-bold">{gasFuelEfficiency} km/L</span>
      </label>
      <input type="range" min="5" max="40" step="0.5" bind:value={gasFuelEfficiency} class="w-full accent-sky-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        ガソリン単価：<span class="text-sky-600 font-bold">{gasPrice} 円/L</span>
      </label>
      <input type="range" min="140" max="200" step="1" bind:value={gasPrice} class="w-full accent-sky-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        EVの電費：<span class="text-sky-600 font-bold">{evEfficiency} km/kWh</span>
      </label>
      <input type="range" min="3" max="12" step="0.1" bind:value={evEfficiency} class="w-full accent-sky-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        自宅充電電気代：<span class="text-sky-600 font-bold">{homeChargePrice} 円/kWh</span>
      </label>
      <input type="range" min="15" max="50" step="1" bind:value={homeChargePrice} class="w-full accent-sky-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        急速充電単価：<span class="text-sky-600 font-bold">{quickChargePrice} 円/分</span>
      </label>
      <input type="range" min="20" max="80" step="1" bind:value={quickChargePrice} class="w-full accent-sky-500" />
      <p class="text-xs text-gray-400 mt-1">概算kWh単価: {quickKwhPrice}円/kWh（30kW出力想定）</p>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        自宅充電の割合：<span class="text-sky-600 font-bold">{homeChargeRatio}%</span>（急速：{quickChargeRatio}%）
      </label>
      <input type="range" min="0" max="100" step="5" bind:value={homeChargeRatio} class="w-full accent-sky-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        EVとガソリン車の車両価格差（任意）：<span class="text-sky-600 font-bold">{priceDiff} 万円</span>
      </label>
      <input type="range" min="0" max="200" step="5" bind:value={priceDiff} class="w-full accent-sky-500" />
    </div>
  </div>

  <!-- Results -->
  <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-bold text-gray-900 mb-4">比較結果</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p class="text-orange-700 font-bold text-sm mb-2">⛽ ガソリン車</p>
        <p class="text-gray-600 text-sm">月間：<span class="text-gray-900 font-bold">{fmt(gasMonthlyCost)}円</span></p>
        <p class="text-gray-600 text-sm">年間：<span class="text-gray-900 font-bold">{fmt(gasYearlyCost)}円</span></p>
      </div>
      <div class="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <p class="text-sky-700 font-bold text-sm mb-2">⚡ EV</p>
        <p class="text-gray-600 text-sm">月間：<span class="text-gray-900 font-bold">{fmt(evMonthlyCost)}円</span></p>
        <p class="text-gray-600 text-sm">年間：<span class="text-gray-900 font-bold">{fmt(evYearlyCost)}円</span></p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg p-4 text-center border border-gray-200">
        <p class="text-gray-500 text-xs mb-1">月間差額</p>
        <p class={`font-bold text-2xl ${monthlyDiff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {monthlyDiff >= 0 ? '▲' : '▼'} {fmt(Math.abs(monthlyDiff))}円
        </p>
        <p class="text-gray-400 text-xs">EVの方が{monthlyDiff >= 0 ? '安い' : '高い'}</p>
      </div>
      <div class="bg-white rounded-lg p-4 text-center border border-gray-200">
        <p class="text-gray-500 text-xs mb-1">{years}年間トータル差額</p>
        <p class={`font-bold text-2xl ${totalDiff10y >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {totalDiff10y >= 0 ? '▲' : '▼'} {fmt(Math.abs(totalDiff10y))}円
        </p>
        <p class="text-gray-400 text-xs">価格差{priceDiff}万円を{priceDiff > 0 ? '含む' : '除く'}</p>
      </div>
      <div class="bg-white rounded-lg p-4 text-center border border-gray-200">
        <p class="text-gray-500 text-xs mb-1">損益分岐（月）</p>
        {#if breakEvenMonths}
          <p class="text-yellow-600 font-bold text-2xl">{breakEvenMonths}<span class="text-sm font-normal text-gray-500 ml-1">ヶ月</span></p>
          <p class="text-gray-400 text-xs">約{Math.floor(breakEvenMonths/12)}年{breakEvenMonths%12}ヶ月</p>
        {:else}
          <p class="text-gray-400 font-bold text-xl">―</p>
          <p class="text-gray-400 text-xs">価格差を入力してください</p>
        {/if}
      </div>
    </div>
  </div>
  <p class="text-xs text-gray-400">※ 急速充電の概算kWh単価は30kW出力を想定しています。計算結果は参考値です。</p>
</div>
