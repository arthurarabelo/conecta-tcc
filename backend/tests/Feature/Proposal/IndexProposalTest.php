<?php

namespace Tests\Feature\Proposal;

use App\Models\Department;
use App\Models\KnowledgeArea;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_authenticated_user_can_list_proposals(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        Proposal::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/proposals');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'title', 'description', 'max_slots', 'status', 'professor']],
                'total',
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_can_list_proposals(): void
    {
        Proposal::factory()->count(2)->create();

        $response = $this->getJson('/api/proposals');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_proposals_can_be_filtered_by_status(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);

        Proposal::factory()->count(2)->create(['professor_id' => $professor->id, 'status' => 'open']);
        Proposal::factory()->create(['professor_id' => $professor->id, 'status' => 'closed']);

        $response = $this->getJson('/api/proposals?status=open');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_proposals_can_be_filtered_by_area_id(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $area1 = KnowledgeArea::create(['name' => 'IA']);
        $area2 = KnowledgeArea::create(['name' => 'BD']);

        Proposal::factory()->count(2)->create(['professor_id' => $professor->id, 'area_id' => $area1->id]);
        Proposal::factory()->create(['professor_id' => $professor->id, 'area_id' => $area2->id]);

        $response = $this->getJson('/api/proposals?area_id=' . $area1->id);

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_proposals_can_be_filtered_by_department_id(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $dept1 = Department::create(['name' => 'CC', 'code' => 'CC']);
        $dept2 = Department::create(['name' => 'SI', 'code' => 'SI']);

        Proposal::factory()->count(3)->create(['professor_id' => $professor->id, 'department_id' => $dept1->id]);
        Proposal::factory()->create(['professor_id' => $professor->id, 'department_id' => $dept2->id]);

        $response = $this->getJson('/api/proposals?department_id=' . $dept1->id);

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }
}
