<?php

namespace Tests\Unit\Models;

use App\Models\KnowledgeArea;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KnowledgeAreaTest extends TestCase
{
    use RefreshDatabase;

    public function test_knowledge_area_can_be_created(): void
    {
        $area = KnowledgeArea::create(['name' => 'Inteligência Artificial']);

        $this->assertEquals('Inteligência Artificial', $area->name);
    }

    public function test_knowledge_area_has_proposals_relation(): void
    {
        $area = KnowledgeArea::create(['name' => 'IA']);
        $professor = User::factory()->create(['role' => 'professor']);
        Proposal::factory()->count(3)->create([
            'professor_id' => $professor->id,
            'area_id' => $area->id,
        ]);

        $this->assertCount(3, $area->proposals);
    }
}
