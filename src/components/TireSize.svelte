<script lang="ts">
  let width1 = $state(205);
  let aspect1 = $state(55);
  let rim1 = $state(16);
  let width2 = $state(215);
  let aspect2 = $state(45);
  let rim2 = $state(17);

  const widthOptions = Array.from({ length: (315 - 155) / 5 + 1 }, (_, i) => 155 + i * 5);
  const aspectOptions = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
  const rimOptions = Array.from({ length: 22 - 13 + 1 }, (_, i) => 13 + i);

  function calcOD(w: number, a: number, r: number): number {
    return r * 25.4 + w * (a / 100) * 2;
  }

  const od1 = $derived(calcOD(width1, aspect1, rim1));
  const od2 = $derived(calcOD(width2, aspect2, rim2));
  const odDiff = $derived(od2 - od1);
  const odDiffPct = $derived((odDiff / od1) * 100);
  const speedError = $derived(-odDiffPct);
  const isCompatible = $derived(Math.abs(odDiffPct) <= 3);
  const widthDiff = $derived(width2 - width1);
  const suggestedAspect = $derived(
    rim2 > rim1 ? Math.max(30, aspect1 - (rim2 - rim1) * 10) : aspect1
  );

  const selectClass = "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100";
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Current -->
    <div class="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <h3 class="text-gray-900 font-bold mb-1">現在のタイヤ</h3>
      <p class="text-sky-600 font-bold text-xl mb-4">{width1}/{aspect1}R{rim1}</p>
      <div class="space-y-3">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">タイヤ幅：<span class="text-sky-600 font-medium">{width1}mm</span></label>
          <select bind:value={width1} class={selectClass}>
            {#each widthOptions as w}<option value={w}>{w}mm</option>{/each}
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">扁平率：<span class="text-sky-600 font-medium">{aspect1}%</span></label>
          <select bind:value={aspect1} class={selectClass}>
            {#each aspectOptions as a}<option value={a}>{a}%</option>{/each}
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">ホイール径：<span class="text-sky-600 font-medium">{rim1}インチ</span></label>
          <select bind:value={rim1} class={selectClass}>
            {#each rimOptions as r}<option value={r}>{r}インチ</option>{/each}
          </select>
        </div>
        <p class="text-gray-500 text-sm">外径：<span class="text-gray-900 font-medium">{od1.toFixed(1)} mm</span></p>
      </div>
    </div>

    <!-- New -->
    <div class="bg-sky-50 rounded-xl p-5 border border-sky-200">
      <h3 class="text-gray-900 font-bold mb-1">変更後のタイヤ</h3>
      <p class="text-sky-600 font-bold text-xl mb-4">{width2}/{aspect2}R{rim2}</p>
      <div class="space-y-3">
        <div>
          <label class="text-sm text-gray-600 mb-1 block">タイヤ幅：<span class="text-sky-600 font-medium">{width2}mm</span></label>
          <select bind:value={width2} class={selectClass}>
            {#each widthOptions as w}<option value={w}>{w}mm</option>{/each}
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">扁平率：<span class="text-sky-600 font-medium">{aspect2}%</span></label>
          <select bind:value={aspect2} class={selectClass}>
            {#each aspectOptions as a}<option value={a}>{a}%</option>{/each}
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-600 mb-1 block">ホイール径：<span class="text-sky-600 font-medium">{rim2}インチ</span></label>
          <select bind:value={rim2} class={selectClass}>
            {#each rimOptions as r}<option value={r}>{r}インチ</option>{/each}
          </select>
        </div>
        <p class="text-gray-500 text-sm">外径：<span class="text-gray-900 font-medium">{od2.toFixed(1)} mm</span></p>
      </div>
    </div>
  </div>

  <!-- Results -->
  <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
    <h3 class="text-lg font-bold text-gray-900 mb-4">チェック結果</h3>
    <div class={`rounded-xl p-4 mb-6 border text-center ${isCompatible ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
      <p class="text-3xl mb-2">{isCompatible ? '✅' : '⚠️'}</p>
      <p class={`text-xl font-bold ${isCompatible ? 'text-green-700' : 'text-yellow-700'}`}>
        {isCompatible ? '互換性あり（外径差±3%以内）' : '要確認（外径差が±3%を超えています）'}
      </p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each [
        ['外径の差', `${odDiff >= 0 ? '+' : ''}${odDiff.toFixed(1)}mm`, Math.abs(odDiff) > 10],
        ['外径差（%）', `${odDiffPct >= 0 ? '+' : ''}${odDiffPct.toFixed(2)}%`, Math.abs(odDiffPct) > 3],
        ['タイヤ幅の差', `${widthDiff >= 0 ? '+' : ''}${widthDiff}mm`, false],
        ['速度メーター誤差', `${speedError >= 0 ? '+' : ''}${speedError.toFixed(2)}%`, Math.abs(speedError) > 3],
      ] as [label, val, warn]}
        <div class="bg-white rounded-lg p-4 text-center border border-gray-200">
          <p class="text-gray-500 text-xs mb-1">{label}</p>
          <p class={`font-bold text-xl ${warn ? 'text-yellow-600' : 'text-sky-600'}`}>{val}</p>
        </div>
      {/each}
    </div>
    {#if rim2 !== rim1}
      <div class="mt-4 bg-sky-50 border border-sky-200 rounded-lg p-4">
        <p class="text-gray-700 text-sm">💡 推奨扁平率（インチアップ時の外径維持）：<span class="text-sky-600 font-bold">{width2}/{suggestedAspect}R{rim2}</span></p>
        <p class="text-gray-500 text-xs mt-1">外径 {calcOD(width2, suggestedAspect, rim2).toFixed(1)}mm（差：{(calcOD(width2, suggestedAspect, rim2) - od1).toFixed(1)}mm）</p>
      </div>
    {/if}
  </div>
  <p class="text-xs text-gray-400">※ 計算結果は参考値です。実際の装着可否は販売店にご確認ください。</p>
</div>
