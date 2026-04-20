<script lang="ts">
  let carPrice = $state(300);
  let downPayment = $state(50);
  let loanYears = $state(5);
  let interestRate = $state(2.9);
  let residualRate = $state(50);

  const loanAmount = $derived((carPrice - downPayment) * 10000);
  const residualAmount = $derived(carPrice * (residualRate / 100) * 10000);
  const residualLoanAmount = $derived(loanAmount - residualAmount);
  const months = $derived(loanYears * 12);
  const monthlyRate = $derived(interestRate / 100 / 12);

  // 通常ローン月々返済額（元利均等）
  function calcMonthlyPayment(principal: number, r: number, n: number): number {
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const normalMonthly = $derived(calcMonthlyPayment(loanAmount, monthlyRate, months));
  const normalTotal = $derived(normalMonthly * months + downPayment * 10000);
  const normalInterest = $derived(normalMonthly * months - loanAmount);

  // 残価設定ローン
  const residualMonthly = $derived(calcMonthlyPayment(residualLoanAmount, monthlyRate, months));
  const residualPeriodTotal = $derived(residualMonthly * months + downPayment * 10000);
  const residualPeriodInterest = $derived(residualMonthly * months - residualLoanAmount);

  function fmt(n: number) {
    return Math.round(n).toLocaleString('ja-JP');
  }
  function fmtMan(n: number) {
    return (n / 10000).toFixed(1);
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        車両価格：<span class="text-sky-400 font-bold">{carPrice} 万円</span>
      </label>
      <input type="range" min="100" max="1000" step="10" bind:value={carPrice} class="w-full accent-sky-500" />
      <div class="flex justify-between text-xs text-slate-500 mt-1">
        <span>100万円</span><span>1,000万円</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        頭金：<span class="text-sky-400 font-bold">{downPayment} 万円</span>
      </label>
      <input type="range" min="0" max={carPrice} step="5" bind:value={downPayment} class="w-full accent-sky-500" />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-2">ローン期間</label>
      <div class="flex gap-3">
        {#each [3, 5, 7] as y}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" bind:group={loanYears} value={y} class="accent-sky-500" />
            <span class="text-slate-300">{y}年</span>
          </label>
        {/each}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1">
        金利：<span class="text-sky-400 font-bold">{interestRate}%</span>
      </label>
      <input type="range" min="0.5" max="8" step="0.1" bind:value={interestRate} class="w-full accent-sky-500" />
    </div>

    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-slate-300 mb-1">
        残価率（残価設定ローン）：<span class="text-sky-400 font-bold">{residualRate}%</span>
        （残価：{fmt(residualAmount)}円）
      </label>
      <input type="range" min="20" max="60" step="5" bind:value={residualRate} class="w-full accent-sky-500" />
    </div>
  </div>

  <!-- Results -->
  <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <h3 class="text-lg font-bold text-white mb-6">比較結果</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- 通常ローン -->
      <div class="bg-slate-700 rounded-xl p-5 border border-slate-600">
        <h4 class="text-white font-bold text-lg mb-4">通常ローン</h4>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">ローン対象額</span>
            <span class="text-white font-medium">{fmt(loanAmount)}円</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">月々の返済額</span>
            <span class="text-sky-400 font-bold text-lg">{fmt(normalMonthly)}円/月</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">利息総額</span>
            <span class="text-red-400 font-medium">{fmt(normalInterest)}円</span>
          </div>
          <div class="flex justify-between border-t border-slate-600 pt-3">
            <span class="text-slate-300 text-sm font-medium">総支払額</span>
            <span class="text-white font-bold">{fmt(normalTotal)}円</span>
          </div>
        </div>
      </div>

      <!-- 残価設定ローン -->
      <div class="bg-sky-950 rounded-xl p-5 border border-sky-700">
        <h4 class="text-white font-bold text-lg mb-4">残価設定ローン</h4>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">ローン対象額</span>
            <span class="text-white font-medium">{fmt(residualLoanAmount)}円</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">月々の返済額</span>
            <span class="text-sky-400 font-bold text-lg">{fmt(residualMonthly)}円/月</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">利息（ローン期間中）</span>
            <span class="text-red-400 font-medium">{fmt(residualPeriodInterest)}円</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400 text-sm">据え置き残価</span>
            <span class="text-yellow-400 font-medium">{fmt(residualAmount)}円</span>
          </div>
          <div class="flex justify-between border-t border-sky-800 pt-3">
            <span class="text-slate-300 text-sm font-medium">期間中の支払総額</span>
            <span class="text-white font-bold">{fmt(residualPeriodTotal)}円</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 比較 -->
    <div class="bg-slate-700 rounded-xl p-5">
      <h4 class="text-slate-300 font-semibold mb-3">ローン期間中の比較</h4>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <p class="text-slate-400 text-xs mb-1">月々の差額</p>
          <p class="text-green-400 font-bold text-xl">▲ {fmt(normalMonthly - residualMonthly)} 円/月</p>
          <p class="text-slate-500 text-xs">残価ローンの方が安い</p>
        </div>
        <div class="text-center">
          <p class="text-slate-400 text-xs mb-1">期間中総支払額の差額</p>
          <p class="text-yellow-400 font-bold text-xl">▲ {fmt(normalTotal - residualPeriodTotal)} 円</p>
          <p class="text-slate-500 text-xs">残価ローンの方が少ない（期間中のみ）</p>
        </div>
      </div>

      <div class="bg-yellow-950 border border-yellow-700 rounded-lg p-4 mt-4">
        <p class="text-yellow-300 text-sm font-semibold mb-2">⚠️ 残価設定ローンの注意点</p>
        <ul class="text-yellow-200 text-xs space-y-1">
          <li>• 期間満了時に残価（{fmt(residualAmount)}円）を一括返済・返却・再ローンのいずれかを選択</li>
          <li>• 走行距離制限（例：年間1万km）を超えると追加費用が発生</li>
          <li>• 傷・内装の劣化が多い場合は精算費用が発生する場合あり</li>
          <li>• 残価割れリスク：車の市場価値が残価を下回ることがある</li>
          <li>• 期間中の途中返済・乗り換えに制限がある場合がある</li>
        </ul>
      </div>
    </div>
  </div>

  <p class="text-xs text-slate-500">※ 計算結果は参考値（元利均等返済）です。実際のローン条件は金融機関・ディーラーにご確認ください。</p>
</div>
